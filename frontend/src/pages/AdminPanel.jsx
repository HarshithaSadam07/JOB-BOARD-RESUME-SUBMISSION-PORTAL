import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";

export default function AdminPanel() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [jobsRes, companiesRes] = await Promise.all([
          api.get("/jobs"),
          api.get("/companies")
        ]);
        setJobs(jobsRes?.data?.items || jobsRes?.data || []);
        setCompanies(companiesRes?.data?.items || companiesRes?.data || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load admin data");
      }
      setLoading(false);
    })();
    try { setReports(JSON.parse(localStorage.getItem('reported_jobs') || '[]')); } catch { setReports([]); }
  }, []);

  const clearReport = (idx) => {
    const next = reports.filter((_, i) => i !== idx);
    setReports(next);
    localStorage.setItem('reported_jobs', JSON.stringify(next));
  };

  const clearAllReports = () => {
    setReports([]);
    localStorage.removeItem('reported_jobs');
  };

  return (
    <>
      <Navbar />
      <div className="container section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Admin Panel</h2>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "#b42318" }}>{error}</p>}

        {!loading && !error && (
          <div className="grid cols-3" style={{ gap: 16 }}>
            <div className="card">
              <h3 style={{ marginBottom: 10 }}>Jobs ({jobs.length})</h3>
              <div style={{ maxHeight: 320, overflow: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j._id}>
                        <td>{j.title}</td>
                        <td>{j.company?.name || j.companyName || j.companyId}</td>
                        <td>{j.location}</td>
                      </tr>
                    ))}
                    {!jobs.length && (
                      <tr><td colSpan="3">No jobs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 10 }}>Companies ({companies.length})</h3>
              <div style={{ maxHeight: 320, overflow: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Website</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(c => (
                      <tr key={c._id}>
                        <td>{c.name}</td>
                        <td>{c.website || "-"}</td>
                        <td>{c.location || "-"}</td>
                      </tr>
                    ))}
                    {!companies.length && (
                      <tr><td colSpan="3">No companies found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3 style={{ marginBottom: 10 }}>Reported Jobs ({reports.length})</h3>
                {reports.length > 0 && (
                  <button className="btn secondary" onClick={clearAllReports}>Clear All</button>
                )}
              </div>
              <div style={{ maxHeight: 320, overflow: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Job</th>
                      <th>Reason</th>
                      <th>Time</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r, i) => (
                      <tr key={i}>
                        <td>{r.title || r.id}</td>
                        <td>{r.reason || '-'}</td>
                        <td>{r.at ? new Date(r.at).toLocaleString() : '-'}</td>
                        <td style={{width:100}}>
                          <button className="btn tertiary" onClick={()=>clearReport(i)}>Clear</button>
                        </td>
                      </tr>
                    ))}
                    {!reports.length && (
                      <tr><td colSpan="4">No reports.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
