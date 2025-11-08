import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";

export default function MyApplications(){
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/applications/mine");
      setItems(data || []);
    })();
  }, []);

  const tabs = [
    { key: "all", label: "All" },
    { key: "applied", label: "Applied" },
    { key: "under review", label: "Under Review" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "rejected", label: "Rejected" },
  ];

  const filtered = items.filter(a => tab === "all" ? true : (String(a.status || "").toLowerCase() === tab));

  const Timeline = ({ status }) => {
    const order = ["applied", "under review", "shortlisted", "rejected"];
    const idx = order.indexOf(String(status || "applied").toLowerCase());
    return (
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        {order.map((s, i) => (
          <div key={s} style={{display:"flex", alignItems:"center", gap:8}}>
            <span className="pill" style={i <= idx ? { background:"var(--accent,#DCD6F7)", color:"var(--primary-text,#424874)" } : {}}>{s.replace(/\b\w/g, c=>c.toUpperCase())}</span>
            {i < order.length - 1 && <span style={{width:24, height:2, background:"#E8EDF5", display:"inline-block"}} />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container section">
        <h2 style={{marginBottom:12}}>Application Tracker</h2>
        <div className="card" style={{display:"flex", gap:8, flexWrap:"wrap", padding:12, marginBottom:12}}>
          {tabs.map(t => (
            <button key={t.key} className="pill" onClick={()=>setTab(t.key)}
              style={tab===t.key? { background:"var(--accent,#DCD6F7)", color:"var(--primary-text,#424874)"}:undefined}>
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && <div className="card">No applications in this tab.</div>}

        <div style={{display:"grid", gap:12}}>
          {filtered.map(a => (
            <div key={a._id} className="card" style={{padding:16, borderRadius:12}}>
              <div style={{display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:600}}>{a.jobId?.title || a.jobTitle || a.jobId}</div>
                  <div style={{color:"#667085", fontSize:14}}>Applied on {new Date(a.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{display:"flex", gap:8}}>
                  <a className="btn secondary" href={a.resumeUrl} target="_blank" rel="noreferrer">Resume</a>
                </div>
              </div>
              <div style={{marginTop:12}}>
                <Timeline status={a.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
