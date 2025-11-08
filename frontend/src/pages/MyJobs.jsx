import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg("");
      try {
        if (user?.companyId) {
          const { data } = await api.get(`/jobs/company/${user.companyId}`);
          setJobs(data?.items || data || []);
          if (!data || (Array.isArray(data) && data.length === 0)) setMsg("No jobs posted yet.");
        } else {
          setJobs([]);
          setMsg("No company linked. Use Recruiter Dashboard and enter a Job ID to view applicants.");
        }
      } catch (e) {
        setMsg(e?.response?.data?.message || "Failed to load jobs");
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.companyId]);

  // Load applicants count per job
  useEffect(() => {
    const run = async () => {
      const next = {};
      for (const j of jobs) {
        try {
          const { data } = await api.get(`/applications/job/${j._id}`);
          next[j._id] = Array.isArray(data) ? data.length : (data?.length || 0);
        } catch {
          next[j._id] = 0;
        }
      }
      setCounts(next);
    };
    if (jobs.length) run();
  }, [jobs]);

  const copy = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      alert("Job ID copied ✅");
    } catch {}
  };

  const viewApplicants = (id) => {
    navigate(`/recruiter?jobId=${id}`);
  };

  const exportCsv = () => {
    const headers = ["Title","Location","Created","Featured","Applicants"];
    const lines = [headers.join(",")];
    jobs.forEach(j => {
      const row = [
        q(j.title),
        q(j.location||""),
        q(j.createdAt ? new Date(j.createdAt).toLocaleString() : "-"),
        q(j.featured ? "Yes" : "No"),
        q(String(counts[j._id] || 0))
      ];
      lines.push(row.join(","));
    });
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'my_jobs.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const q = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
  };

  return (
    <>
      <Navbar />
      <div className="container section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>My Jobs</h2>
          <div style={{display:'flex', gap:8}}>
            <button className="btn secondary" onClick={exportCsv}>Export CSV</button>
            <button className="btn" onClick={() => navigate("/recruiter/post")}>➕ Post Job</button>
          </div>
        </div>

        {loading && <p>Loading...</p>}
        {msg && !loading && <p style={{ color: "#667085" }}>{msg}</p>}

        {!loading && jobs.length > 0 && (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Featured</th>
                  <th>Applicants</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j._id}>
                    <td>{j.title}</td>
                    <td>{j.location}</td>
                    <td>{j.featured ? '⭐' : '—'}</td>
                    <td>{counts[j._id] ?? '—'}</td>
                    <td>{j.createdAt ? new Date(j.createdAt).toLocaleString() : "-"}</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button className="btn" onClick={() => viewApplicants(j._id)}>View Applicants</button>
                      <button className="btn secondary" onClick={() => copy(j._id)}>Copy Job ID</button>
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
