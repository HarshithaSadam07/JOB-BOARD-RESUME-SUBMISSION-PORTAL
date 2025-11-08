import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";

export default function Register(){
  const nav = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"candidate" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const bgUrl = "https://wallpaperaccess.com/full/1393442.jpg";
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      await api.post("/auth/register", form);
      setOk("Registered! Please login.");
      setTimeout(()=>nav("/login"), 600);
    } catch (e) {
      setErr(e?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <Navbar />
      <section
        style={bgUrl ? {
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: "40px 0",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center"
        } : undefined}
      >
      <div className="container" style={{maxWidth:1400, padding: '0 20px'}}>
        <div style={{ background: "#ffffff", padding: 40, borderRadius: 16, boxShadow: "0 14px 40px rgba(0,0,0,0.12)", maxWidth: 800, margin: "0 auto", width: "100%" }}>
        <h2 style={{marginBottom:12}}>Create Account</h2>
        <form className="card" onSubmit={submit}>
          <div style={{display:"grid", gap:16}}>
            <input className="input" placeholder="Full name"
              value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
            <input className="input" placeholder="Email" type="email"
              value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
            <input className="input" placeholder="Password" type="password"
              value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
            </select>
            {err && <div style={{color:"#dc2626"}}>{err}</div>}
            {ok && <div style={{color:"#15803d"}}>{ok}</div>}
            <button className="btn" type="submit">Register</button>
            <div style={{color:"#667085"}}>Have an account? <Link to="/login">Login</Link></div>
          </div>
        </form>
        </div>
      </div>
      </section>
      <Footer />
    </>
  );
}
