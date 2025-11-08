import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function JobDetails(){
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [savedSet, setSavedSet] = useState(()=>{
    try { return new Set(JSON.parse(localStorage.getItem("saved_jobs") || "[]")); } catch { return new Set(); }
  });
  const { user } = useAuth();
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data);
    })();
  }, [id]);

  useEffect(() => {
    if(!job) return;
    (async () => {
      try {
        const { data } = await api.get("/jobs", { params: { q: job.title, location: job.location, limit: 5 } });
        setSimilar((data?.data || data || []).filter(x => (x._id||x.id) !== (job._id||job.id)).slice(0,5));
      } catch {}
    })();
  }, [job]);

  useEffect(() => {
    if(!job) return;
    try {
      const list = JSON.parse(localStorage.getItem('recent_jobs') || '[]');
      const key = job._id || job.id;
      const meta = { id: key, title: job.title, companyName: job.company?.name || job.companyName, location: job.location, at: new Date().toISOString() };
      const filtered = list.filter(x => (x.id) !== key);
      const next = [meta, ...filtered].slice(0, 10);
      localStorage.setItem('recent_jobs', JSON.stringify(next));
    } catch {}
  }, [job]);

  const isSaved = (jobId) => savedSet.has(jobId);
  const toggleSave = (j) => {
    const key = j._id || j.id;
    const next = new Set(savedSet);
    if(next.has(key)) next.delete(key); else next.add(key);
    setSavedSet(next);
    localStorage.setItem("saved_jobs", JSON.stringify(Array.from(next)));
    try {
      const existing = JSON.parse(localStorage.getItem("saved_jobs_meta") || "[]");
      let list = Array.isArray(existing) ? existing : [];
      if(next.has(key)){
        const snap = { _id: key, title: j.title || j.role, companyName: j.companyName || j.company?.name, location: j.location || j.city || j.country, type: j.type, expLevel: j.expLevel };
        const idx = list.findIndex(x => (x._id || x.id) === key);
        if(idx >= 0) list[idx] = snap; else list.push(snap);
      } else {
        list = list.filter(x => (x._id || x.id) !== key);
      }
      localStorage.setItem("saved_jobs_meta", JSON.stringify(list));
    } catch {}
  };

  const submitReport = () => {
    try{
      const list = JSON.parse(localStorage.getItem("reported_jobs") || "[]");
      list.push({ id: job?._id || id, title: job?.title, reason: reportReason || "", at: new Date().toISOString() });
      localStorage.setItem("reported_jobs", JSON.stringify(list));
      setShowReport(false); setReportReason("");
      alert("Reported. Thank you.");
    }catch{ setShowReport(false); }
  };

  const shareJob = async () => {
    const url = window.location.href;
    const title = job?.title || "Job";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
      }
    } catch {}
  };

  if (!job) return null;

  return (
    <>
      <Navbar />
      <div className="container section" style={{display:"grid", gridTemplateColumns:"1fr 320px", gap:24}}>
        <div className="card">
          <h2 style={{marginBottom:8}}>{job.title}</h2>
          <div style={{color:"#667085"}}>{job.location} • {job.expLevel} • {job.type}</div>
          <p style={{marginTop:12}}>{job.description}</p>
          <div style={{marginTop:12, display:"flex", gap:8, flexWrap:"wrap"}}>
            {(job.skills||[]).map(s => (
              <span key={s} style={{fontSize:12, background:"#eef2ff", color:"#1e40af", padding:"4px 8px", borderRadius:999}}>{s}</span>
            ))}
          </div>
          <div style={{marginTop:16, display:"flex", gap:8, flexWrap:"wrap"}}>
            {user?.role === "candidate" ? (
              <Link to={`/jobs/${job._id}/apply`} className="btn">Apply</Link>
            ) : (
              <span style={{color:"#667085"}}>Login as candidate to apply.</span>
            )}
            <button className="btn secondary" type="button" onClick={()=>toggleSave(job)}>
              {isSaved(job._id || job.id) ? "Saved" : "Save"}
            </button>
            <button className="btn tertiary" type="button" onClick={shareJob}>Share</button>
            <button className="btn tertiary" type="button" onClick={()=>setShowReport(true)}>Report</button>
          </div>
        </div>

        <aside className="card" style={{padding:16, borderRadius:12}}>
          <h3 style={{marginTop:0}}>Similar Jobs</h3>
          <div style={{display:"grid", gap:10}}>
            {similar.length === 0 && <div style={{color:"#667085"}}>No similar jobs found.</div>}
            {similar.map(j => (
              <div key={j._id || j.id} style={{display:"grid", gap:4}}>
                <Link to={`/jobs/${j._id || j.id}`} style={{fontWeight:600}}>{j.title || j.role}</Link>
                <div style={{color:"#667085", fontSize:14}}>{j.companyName || j.company?.name || "Company"} • {j.location || j.city || j.country || "Location"}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
      <Footer />
      {showReport && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
          <div className="card" style={{maxWidth:520, width:'100%', padding:16}}>
            <h3 style={{marginTop:0}}>Report this job</h3>
            <p style={{color:'#667085'}}>Tell us briefly what seems wrong with this posting.</p>
            <textarea className="input" rows={4} placeholder="Reason" value={reportReason} onChange={e=>setReportReason(e.target.value)} />
            <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:10}}>
              <button className="btn secondary" type="button" onClick={()=>{setShowReport(false); setReportReason("");}}>Cancel</button>
              <button className="btn" type="button" onClick={submitReport}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
