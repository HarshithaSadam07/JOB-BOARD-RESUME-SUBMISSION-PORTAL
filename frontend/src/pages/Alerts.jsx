import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Alerts(){
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ keywords:"", location:"", frequency:"daily" });

  useEffect(()=>{
    try{ setAlerts(JSON.parse(localStorage.getItem("job_alerts") || "[]")); } catch { setAlerts([]); }
  },[]);

  const saveAll = (list) => {
    setAlerts(list);
    localStorage.setItem("job_alerts", JSON.stringify(list));
  };

  const add = () => {
    if(!form.keywords.trim()) return;
    const item = { id: Date.now().toString(), ...form };
    const next = [item, ...alerts];
    saveAll(next);
    setForm({ keywords:"", location:"", frequency:"daily" });
  };

  const remove = (id) => saveAll(alerts.filter(a => a.id !== id));

  return (
    <>
      <Navbar />
      <section className="container" style={{padding:"24px 0"}}>
        <h2 style={{marginBottom:12}}>Job Alerts</h2>

        <div className="card" style={{padding:16, borderRadius:12, marginBottom:16}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 200px 120px", gap:8}}>
            <input className="input" placeholder="Keywords (e.g. React, Node)" value={form.keywords} onChange={e=>setForm({...form, keywords:e.target.value})} />
            <input className="input" placeholder="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} />
            <select className="input" value={form.frequency} onChange={e=>setForm({...form, frequency:e.target.value})}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button className="btn" type="button" onClick={add}>Create Alert</button>
          </div>
        </div>

        <div style={{display:"grid", gap:12}}>
          {alerts.length === 0 && <div className="card">No alerts yet. Create one above.</div>}
          {alerts.map(a => (
            <div key={a.id} className="card" style={{padding:16, borderRadius:12, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12}}>
              <div>
                <div style={{fontWeight:600}}>{a.keywords}</div>
                <div style={{color:"#667085", fontSize:14}}>{a.location || "Anywhere"} • {a.frequency}</div>
              </div>
              <div style={{display:"flex", gap:8}}>
                <button className="btn secondary" type="button" onClick={()=>remove(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
