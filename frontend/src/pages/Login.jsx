import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Login(){
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email:"", password:"" });
  const [err, setErr] = useState("");
  const bgUrl = "https://wallpaperaccess.com/full/1393442.jpg";

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(form);
      nav("/");
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  };

  // OAuth callback handler: ?token=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("access_token", token);
      nav("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="container" style={{maxWidth:1200}}>
        <div style={{ background: "#ffffff", padding: 28, borderRadius: 16, boxShadow: "0 14px 40px rgba(0,0,0,0.12)", maxWidth: 1000, margin: "0 auto", width: "100%" }}>
          <h2 style={{marginBottom:12}}>Login</h2>
          <form className="card" onSubmit={submit}>
            <div style={{display:"grid", gap:16}}>
              <input className="input" placeholder="Email" type="email"
                value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
              <input className="input" placeholder="Password" type="password"
                value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
              {err && <div style={{color:"#dc2626"}}>{err}</div>}
              <button className="btn" type="submit">Login</button>
              <div style={{color:"#667085"}}>No account? <Link to="/register">Register</Link></div>
            </div>
          </form>
        </div>
      </div>
      </section>
      <Footer />
    </>
  );
}
