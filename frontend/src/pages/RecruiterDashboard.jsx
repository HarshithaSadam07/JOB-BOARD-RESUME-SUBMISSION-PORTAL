import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobId, setJobId] = useState("");
  const [apps, setApps] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setMsg("");
    setLoading(true);
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      setApps(data || []);
      if (!data?.length) setMsg("No applicants yet for this job.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load applicants");
    }
    setLoading(false);
  };

  const loadAllForRecruiter = async () => {
    setMsg("");
    setLoading(true);
    try {
      let jobsData = [];
      if (user?.companyId) {
        const resp = await api.get(`/jobs/company/${user.companyId}`);
        jobsData = resp.data || [];
      } else {
        // Fallback: try to get recruiter's own jobs
        try {
          const respMine = await api.get(`/jobs/mine`);
          jobsData = respMine.data || [];
        } catch (e) {
          // leave jobsData empty, show message below
        }
      }
      setJobs(jobsData || []);
      if (!jobsData?.length) {
        setMsg("No jobs found for your account.");
        setApps([]);
        setLoading(false);
        return;
      }
      // Fetch applications for each job
      const results = [];
      for (const j of jobsData) {
        try {
          const { data: a } = await api.get(`/applications/job/${j._id || j.id}`);
          (a || []).forEach(x => results.push({ ...x, __job: { id: j._id || j.id, title: j.title || j.role } }));
        } catch {}
      }
      setApps(results);
      if (!results.length) setMsg("No applicants yet across your jobs.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load applicants");
    }
    setLoading(false);
  };

  const changeStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/applications/${id}/status`, { status });
      setApps(prev => prev.map(a => a._id === id ? data : a));
      alert(`Status updated to ${status}`);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update");
    }
  };

  const copyJobId = () => {
    navigator.clipboard.writeText(jobId);
    alert("Job ID copied ✅");
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qId = params.get("jobId");
    if (qId) {
      setJobId(qId);
      // defer load to ensure state update applies
      setTimeout(() => {
        (async () => {
          await load();
        })();
      }, 0);
    }
    // Auto-load all applicants for recruiter on first visit when no jobId is provided
    if (!qId && user?.role === "recruiter") {
      loadAllForRecruiter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, user?.role]);

  return (
    <>
      <Navbar />

      <div className="container section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Recruiter Dashboard</h2>
          <button className="btn" onClick={() => navigate("/recruiter/post")}>
            ➕ Post a Job
          </button>
        </div>

        <div className="card" style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
          <input
            className="input"
            placeholder="Enter Job ID"
            value={jobId}
            onChange={e => setJobId(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn" onClick={load}>Load Applicants</button>
          {jobId && <button className="btn secondary" onClick={copyJobId}>Copy</button>}
          <button className="btn tertiary" onClick={loadAllForRecruiter}>Load All Applicants</button>
        </div>

        {/* Summary counters */}
        {apps.length > 0 && (
          <div className="card" style={{marginTop:12, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center"}}>
            {(() => {
              const counts = apps.reduce((acc, a) => { const s = String(a.status||'applied').toLowerCase(); acc[s] = (acc[s]||0)+1; acc.all=(acc.all||0)+1; return acc; }, {});
              const pill = (label, key) => (
                <button
                  key={key}
                  className="pill"
                  onClick={()=>setStatusFilter(key)}
                  style={statusFilter===key? { background:"var(--accent,#DCD6F7)", color:"var(--primary-text,#424874)" } : undefined}
                >{label}: {counts[key]||0}</button>
              );
              return (
                <>
                  {pill('All','all')}
                  {pill('Applied','applied')}
                  {pill('Under Review','under review')}
                  {pill('Shortlisted','shortlisted')}
                  {pill('Rejected','declined')}
                </>
              );
            })()}
            <button className="btn secondary" type="button" onClick={()=>exportCsv(apps)}>Export CSV</button>
          </div>
        )}

        {loading && <p style={{ marginTop: 10 }}>Loading...</p>}
        {msg && <p style={{ marginTop: 10, color: "#667085" }}>{msg}</p>}

        {apps.length > 0 && (
          <div className="card" style={{ marginTop: 16 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Candidate</th>
                  <th>Resume</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.filter(a => statusFilter==='all' ? true : String(a.status||'').toLowerCase() === statusFilter).map(a => (
                  <tr key={a._id}>
                    <td>{a.__job?.title || a.jobTitle || a.jobId}</td>
                    <td>{a.user?.name || a.userId}</td>
                    <td>
                      <a className="btn secondary" href={a.resumeUrl} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    </td>
                    <td>{a.status}</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button className="btn" onClick={() => changeStatus(a._id, "shortlisted")}>
                        Shortlist
                      </button>
                      <button className="btn secondary" onClick={() => changeStatus(a._id, "declined")}>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

function exportCsv(rows){
  const headers = ["Job","Candidate","Resume","Status"]; 
  const lines = [headers.join(",")];
  rows.forEach(a => {
    const vals = [
      quote(a.__job?.title || a.jobTitle || a.jobId),
      quote(a.user?.name || a.userId),
      quote(a.resumeUrl || ""),
      quote(a.status || "")
    ];
    lines.push(vals.join(","));
  });
  const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'applicants.csv'; a.click();
  URL.revokeObjectURL(url);
}

function quote(v){
  const s = String(v ?? "");
  if(/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
  return s;
}
