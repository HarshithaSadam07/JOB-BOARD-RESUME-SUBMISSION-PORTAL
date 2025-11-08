import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = () => { 
    logout(); 
    nav("/"); 
  };

  return (
    <nav className="nav">
      <div className="container wrap">

        {/* Brand */}
        <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)',
            borderRadius: '10px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            JW
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            JobWave
          </span>
        </Link>

        {/* Main Nav Links */}
        <div className="nav-links">
          <Link to="/search">Jobs</Link>
          <Link to="/companies" style={{ marginLeft: 12 }}>Companies</Link>
          <Link to="/about" style={{ marginLeft: 12 }}>About Us</Link>

          {user?.role === "candidate" && (
            <Link to="/applications" style={{ marginLeft: 12 }}>
              My Applications
            </Link>
          )}
          {user?.role === "candidate" && (
            <Link to="/profile" style={{ marginLeft: 12 }}>
              Profile
            </Link>
          )}
          {user?.role === "candidate" && (
            <Link to="/saved" style={{ marginLeft: 12 }}>
              Saved Jobs
            </Link>
          )}
          {user?.role === "candidate" && (
            <Link to="/alerts" style={{ marginLeft: 12 }}>
              Alerts
            </Link>
          )}

          {user?.role === "recruiter" && (
            <>
              <Link to="/recruiter" style={{ marginLeft: 12 }}>
                Dashboard
              </Link>

              <Link to="/recruiter/post" style={{ marginLeft: 12 }}>
                Post Job
              </Link>

              <Link to="/recruiter/jobs" style={{ marginLeft: 12 }}>
                My Jobs
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" style={{ marginLeft: 12 }}>
              Admin Panel
            </Link>
          )}
        </div>

        {/* Auth + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user?.role === "recruiter" || user?.role === "admin" ? (
            <Link to="/recruiter/post" className="btn">Post a Job</Link>
          ) : (
            <Link to={user ? "/jobs" : "/login"} className="btn">Post a Job</Link>
          )}

          {!user ? (
            <>
              <Link to="/login" className="btn secondary">
                Login
              </Link>
            </>
          ) : (
            <button className="btn secondary" onClick={onLogout}>Logout</button>
          )}
        </div>

      </div>
    </nav>
  );
}
