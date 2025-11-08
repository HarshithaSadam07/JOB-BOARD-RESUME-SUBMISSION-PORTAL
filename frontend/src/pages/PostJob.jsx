import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    companyName: "",
    description: "",
    location: "",
    expLevel: "",
    type: "",
    salaryMin: "",
    salaryMax: "",
    skills: "",
    featured: false
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Candidate cannot access
  if (user?.role === "candidate") {
    return (
      <div className="container section">
        <h2>Access Denied</h2>
        <p>Only recruiters and admins can post jobs.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map(s => s.trim())
      };
      if (!payload.companyName) {
        delete payload.companyName;
      }

      await api.post("/jobs", payload);
      setMsg("✅ Job posted successfully!");

      setTimeout(() => navigate("/recruiter"), 1000);

    } catch (err) {
      setMsg(err?.response?.data?.message || "❌ Failed to post job");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div className="container section" style={{ maxWidth: 600 }}>
        <h2>Post a Job</h2>

        <form onSubmit={submit} className="card" style={{ gap: 12 }}>

          <input
            className="input"
            name="title"
            placeholder="Job Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            name="companyName"
            placeholder="Company Name (optional)"
            value={form.companyName}
            onChange={handleChange}
          />

          <textarea
            className="input"
            name="description"
            placeholder="Job Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            required
          />

          <input
            className="input"
            name="location"
            placeholder="Location (e.g. Hyderabad)"
            value={form.location}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            name="expLevel"
            style={{ display: "none" }}
            value={form.expLevel}
            readOnly
          />
          <select
            className="input"
            name="expLevel"
            value={form.expLevel}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Experience Level</option>
            <option value="intern">Intern</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>

          <input
            className="input"
            name="type"
            style={{ display: "none" }}
            value={form.type}
            readOnly
          />
          <select
            className="input"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Job Type</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              name="salaryMin"
              type="number"
              placeholder="Min Salary"
              value={form.salaryMin}
              onChange={handleChange}
            />
            <input
              className="input"
              name="salaryMax"
              type="number"
              placeholder="Max Salary"
              value={form.salaryMax}
              onChange={handleChange}
            />
          </div>

          <input
            className="input"
            name="skills"
            placeholder="Skills (comma separated e.g. react, node, css)"
            value={form.skills}
            onChange={handleChange}
            required
          />

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              name="featured"
              checked={!!form.featured}
              onChange={e => setForm({ ...form, featured: e.target.checked })}
            />
            Mark as Featured (appears highlighted in listings)
          </label>

          <button className="btn" disabled={loading}>
            {loading ? "Posting..." : "Post Job"}
          </button>

          {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
        </form>
      </div>

      <Footer />
    </>
  );
}
