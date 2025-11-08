import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // company being edited
  const [form, setForm] = useState({ name: "", website: "", location: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", website: "", location: "", description: "", verified: false });
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/companies");
        setCompanies(data || []);
      } catch (e) {
        console.log("Error loading companies:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = companies
    .filter(c => c?.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(c => (showVerifiedOnly ? !!c.verified : true))
    .sort((a, b) => (b.verified === a.verified ? (a.name||"").localeCompare(b.name||"") : (b.verified?1:0) - (a.verified?1:0)));

  const canEditCompany = (c) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "recruiter" && user.companyId && user.companyId === c._id) return true;
    return false;
  };

  const startEdit = (c) => {
    setEditing(c);
    setError("");
    setForm({
      name: c.name || "",
      website: c.website || "",
      location: c.location || "",
      description: c.description || ""
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setSaving(false);
    setError("");
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await api.patch(`/companies/${editing._id}`, form);
      setCompanies(prev => prev.map(x => x._id === editing._id ? { ...x, ...data } : x));
      cancelEdit();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update company");
      setSaving(false);
    }
  };

  const toggleVerify = async (company) => {
    try {
      const next = !company.verified;
      const { data } = await api.patch(`/companies/${company._id}`, { verified: next });
      setCompanies(prev => prev.map(x => x._id === company._id ? { ...x, ...data } : x));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update verification status");
    }
  };

  const startCreate = () => {
    if (user?.role !== "admin") return;
    setCreating(true);
    setCreateError("");
    setCreateSaving(false);
    setCreateForm({ name: "", website: "", location: "", description: "", verified: false });
  };

  const cancelCreate = () => {
    setCreating(false);
    setCreateError("");
    setCreateSaving(false);
  };

  const onCreateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (user?.role !== "admin") { alert("Only admins can add companies."); return; }
    setCreateSaving(true);
    setCreateError("");
    try {
      const payload = { ...createForm };
      if (user?.role !== "admin") delete payload.verified;
      const { data } = await api.post("/companies", payload);
      setCompanies(prev => [data, ...prev]);
      cancelCreate();
    } catch (err) {
      setCreateError(err?.response?.data?.message || "Failed to create company");
      setCreateSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container section">
        <h2>Companies ({filtered.length})</h2>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0" }}>
          <input
            className="input"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 300 }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={showVerifiedOnly} onChange={(e)=>setShowVerifiedOnly(e.target.checked)} />
            Show only verified
          </label>
          {user?.role === "admin" && (
            <button className="btn" onClick={startCreate}>Add Company</button>
          )}
        </div>

        {/* Edit Card */}
        {editing && (
          <div className="card" style={{ marginBottom: 16, maxWidth: 700 }}>
            <h3 style={{ marginTop: 0 }}>Edit Company</h3>
            <form onSubmit={saveEdit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input className="input" name="name" placeholder="Company Name" value={form.name} onChange={onChange} required />
              <input className="input" name="website" placeholder="Website (https://...)" value={form.website} onChange={onChange} />
              <input className="input" name="location" placeholder="Location" value={form.location} onChange={onChange} />
              <textarea className="input" name="description" placeholder="Description" rows={3} value={form.description} onChange={onChange} />
              {error && <p style={{ color: "#b42318" }}>{error}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                <button type="button" className="btn secondary" onClick={cancelEdit} disabled={saving}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Create Card */}
        {creating && (
          <div className="card" style={{ marginBottom: 16, maxWidth: 700 }}>
            <h3 style={{ marginTop: 0 }}>Add Company</h3>
            <form onSubmit={submitCreate} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input className="input" name="name" placeholder="Company Name" value={createForm.name} onChange={onCreateChange} required />
              <input className="input" name="website" placeholder="Website (https://...)" value={createForm.website} onChange={onCreateChange} />
              <input className="input" name="location" placeholder="Location" value={createForm.location} onChange={onCreateChange} />
              <textarea className="input" name="description" placeholder="Description" rows={3} value={createForm.description} onChange={onCreateChange} />
              {user?.role === "admin" && (
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" name="verified" checked={createForm.verified} onChange={onCreateChange} />
                  Verified
                </label>
              )}
              {createError && <p style={{ color: "#b42318" }}>{createError}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" disabled={createSaving}>{createSaving ? "Creating..." : "Create"}</button>
                <button type="button" className="btn secondary" onClick={cancelCreate} disabled={createSaving}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="card" style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Website</th>
                  <th>Jobs</th>
                  <th>Verified</th>
                  {(user?.role === "admin" || user?.role === "recruiter") && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/company/${c._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{c.name}</td>
                    <td>
                      {c.website ? (
                        <a href={c.website} target="_blank" rel="noreferrer">
                          {c.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : "—"}
                    </td>
                    <td>{c.jobCount ?? 0}</td>
                    <td>{c.verified ? "✅" : "❌"}</td>
                    {(user?.role === "admin" || user?.role === "recruiter") && (
                      <td style={{ width: 220 }} onClick={(e) => e.stopPropagation()}>
                        {canEditCompany(c) ? (
                          <>
                            <button className="btn secondary" onClick={() => startEdit(c)}>
                              Edit
                            </button>
                            {user?.role === "admin" && (
                              <button
                                className="btn"
                                style={{ marginLeft: 8 }}
                                onClick={() => toggleVerify(c)}
                              >
                                {c.verified ? "Unverify" : "Verify"}
                              </button>
                            )}
                          </>
                        ) : (
                          user?.role === "admin" ? (
                            <button className="btn" onClick={() => toggleVerify(c)}>
                              {c.verified ? "Unverify" : "Verify"}
                            </button>
                          ) : (
                            <span style={{ color: "#667085" }}>—</span>
                          )
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
