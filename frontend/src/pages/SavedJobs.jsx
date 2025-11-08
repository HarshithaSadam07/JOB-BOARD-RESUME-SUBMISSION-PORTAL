import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SavedJobs(){
  const [ids, setIds] = useState([]);
  const [meta, setMeta] = useState([]);

  const exportCsv = () => {
    const headers = ["Title","Company","Location","Type","ExpLevel","Id"];
    const lines = [headers.join(",")];
    const q = (v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
    };
    const rows = (meta.length ? meta : ids.map(id => ({ id })));
    rows.forEach(j => {
      lines.push([
        q(j.title || j.role || ""),
        q(j.companyName || j.company?.name || ""),
        q(j.location || j.city || j.country || ""),
        q(j.type || ""),
        q(j.expLevel || ""),
        q(j._id || j.id || "")
      ].join(","));
    });
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'saved_jobs.csv'; a.click(); URL.revokeObjectURL(url);
  };

  useEffect(()=>{
    try {
      const stored = JSON.parse(localStorage.getItem("saved_jobs") || "[]");
      const storedMeta = JSON.parse(localStorage.getItem("saved_jobs_meta") || "[]");
      setIds(stored);
      setMeta(storedMeta);
    } catch { setIds([]); setMeta([]); }
  }, []);

  const remove = (id) => {
    const nextIds = ids.filter(x=>x!==id);
    const nextMeta = meta.filter(x=> (x._id||x.id) !== id);
    setIds(nextIds);
    setMeta(nextMeta);
    localStorage.setItem("saved_jobs", JSON.stringify(nextIds));
    localStorage.setItem("saved_jobs_meta", JSON.stringify(nextMeta));
  };

  return (
    <>
      <Navbar />
      <section className="container" style={{padding:"24px 0"}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Saved Jobs</h2>
          {(ids.length > 0) && <button className="btn secondary" type="button" onClick={exportCsv}>Export CSV</button>}
        </div>
        {ids.length === 0 && <div className="card">No saved jobs yet.</div>}
        <div style={{display:"grid", gap:12}}>
          {meta.length > 0 ? meta.map(j => (
            <div key={j._id || j.id} className="card" style={{padding:16, borderRadius:12}}>
              <div style={{display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:600}}>{j.title || j.role || "Job"}</div>
                  <div style={{color:"#667085"}}>{j.companyName || j.company?.name || "Company"} • {j.location || j.city || j.country || "Location"}</div>
                </div>
                <div style={{display:"flex", gap:8, alignItems:"center"}}>
                  {j.type && <span className="pill">{j.type}</span>}
                  {j.expLevel && <span className="pill">{j.expLevel}</span>}
                </div>
              </div>
              <div style={{display:"flex", gap:8, marginTop:10}}>
                <Link className="btn" to={`/jobs/${j._id || j.id}`}>View</Link>
                <button className="btn secondary" type="button" onClick={()=>remove(j._id || j.id)}>Remove</button>
              </div>
            </div>
          )) : ids.map(id => (
            <div key={id} className="card" style={{padding:16, borderRadius:12, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>Job ID: {id}</div>
              <div style={{display:"flex", gap:8}}>
                <Link className="btn" to={`/jobs/${id}`}>View</Link>
                <button className="btn secondary" type="button" onClick={()=>remove(id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
