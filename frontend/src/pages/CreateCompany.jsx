import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function CreateCompany() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    website: "",
    location: "",
    description: ""
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (user?.role === "candidate") {
    return (
      <div className="container section">
        <h2>Access Denied</h2>
        <p>Only recruiters and admins can create companies.</p>
      </div>
    );
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await api.post("/companies", form);
      setMsg("✅ Company created successfully!");
      setTimeout(() => navigate("/recruiter"), 1000);
    } catch (err) {
      setMsg(err?.response?.data?.message || "❌ Failed to create company");
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="container section" style={{ maxWidth: 640 }}>
        <h2>Create Company</h2>
        <form onSubmit={submit} className="card" style={{ gap: 12 }}>
          <input
            className="input"
            name="name"
            placeholder="Company Name"
            value={form.name}
            onChange={onChange}
            required
          />
          <input
            className="input"
            name="website"
            placeholder="Website (https://...)"
            value={form.website}
            onChange={onChange}
          />
          <input
            className="input"
            name="location"
            placeholder="Location (e.g. Bengaluru)"
            value={form.location}
            onChange={onChange}
          />
          <textarea
            className="input"
            name="description"
            placeholder="Short description"
            rows={4}
            value={form.description}
            onChange={onChange}
          />
          <button className="btn" disabled={loading}>
            {loading ? "Creating..." : "Create Company"}
          </button>
          {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
        </form>
      </div>
      <Footer />
    </>
  );
}
