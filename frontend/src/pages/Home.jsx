import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const navigate = useNavigate();
  const bgUrl = "https://thumbs.dreamstime.com/b/group-business-people-having-board-meeting-around-glass-table-55894688.jpg";

  return (
    <>
      <Navbar />

      <section
        className="hero"
        style={bgUrl ? {
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        } : undefined}
      >
        <div className="container" style={bgUrl ? { backgroundColor: "rgba(0,0,0,0.55)", padding: 36, borderRadius: 12, color: "#fff", textAlign: "center" } : undefined}>
          <h1 className="title" style={{ fontSize: 48, fontWeight: 800 }}>Find Your Dream Job Today</h1>
          <p className="sub" style={{ fontSize: 18, opacity: 0.95 }}>Browse thousands of jobs and apply in minutes.</p>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
            />
            <button className="btn">Search</button>
          </div>

          <div className="search">
            <Link to="/jobs" className="btn">Browse Jobs</Link>
            <Link to="/recruiter/post" className="btn secondary">Post a Job</Link>
            <Link to="/recruiter/jobs" className="btn secondary">My Jobs</Link>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            <span className="pill">Engineering</span>
            <span className="pill">Design</span>
            <span className="pill">Marketing</span>
            <span className="pill">Sales</span>
            <span className="pill">Product</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800 }}>2k+</div>
            <div style={{ color: "#667085" }}>Jobs Posted</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800 }}>500+</div>
            <div style={{ color: "#667085" }}>Companies</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800 }}>10k+</div>
            <div style={{ color: "#667085" }}>Candidates</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid cols-3">

          <div className="card" onClick={() => navigate("/jobs")} style={{ cursor: "pointer" }}>
            <b>Fast Apply</b>
            <p style={{ marginTop: 6 }}>Upload resume and apply instantly.</p>
          </div>

          <div className="card" onClick={() => navigate("/companies")} style={{ cursor: "pointer" }}>
            <b>Verified Companies</b>
            <p style={{ marginTop: 6 }}>Work with trusted employers.</p>
          </div>

          <div className="card" onClick={() => navigate("/jobs?filters=true")} style={{ cursor: "pointer" }}>
            <b>Smart Filters</b>
            <p style={{ marginTop: 6 }}>Find roles that fit your skills.</p>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
