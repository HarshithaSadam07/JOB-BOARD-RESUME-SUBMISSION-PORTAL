import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import useAuth from "../hooks/useAuth";

export default function CompanyPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", website: "", location: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    loadPage();
  }, [id]);

  const loadPage = async () => {
    try {
      const companyRes = await api.get(`/companies/${id}`);
      setCompany(companyRes.data);

      const jobsRes = await api.get(`/jobs/company/${id}`);
      setJobs(jobsRes.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = () => {
    if (!user || !company) return false;
    return user.role === "admin";
  };

  const startEdit = () => {
    if (!company) return;
    setEditing(true);
    setError("");
    setForm({
      name: company.name || "",
      website: company.website || "",
      location: company.location || "",
      description: company.description || ""
    });
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaving(false);
    setError("");
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.patch(`/companies/${id}`, form);
      await loadPage();
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update company");
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!company) return <p style={{ padding: 20 }}>Company not found</p>;

  return (
    <>
      <Navbar />

      <div className="container section" style={{ maxWidth: 1000 }}>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt="logo"
                style={{ width: 70, height: 70, borderRadius: 8, objectFit: "cover" }}
              />
            )}

            <div>
              <h2 style={{ margin: 0 }}>
                {company.name}{" "}
                {company.verified && (
                  <span style={{ fontSize: 15, color: "green" }}>✔ Verified</span>
                )}
              </h2>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 14, color: "#2563eb" }}
                >
                  {company.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
            {canEdit() && !editing && (
              <div style={{ marginLeft: "auto" }}>
                <button className="btn secondary" onClick={startEdit}>Edit</button>
              </div>
            )}
          </div>
        </div>

        {canEdit() && editing && (
          <div className="card" style={{ marginTop: 12 }}>
            <h3 style={{ marginTop: 0 }}>Edit Company</h3>
            <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
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

        {/* Details grid: About + Sidebar */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 320px", gap:24, marginTop:16}}>
          <div>
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{marginTop:0}}>About</h3>
              <p style={{color:'#475467'}}>{company.description || 'No description available.'}</p>
            </div>

            <div className="card" style={{ padding: 16, marginTop:12 }}>
              <h3 style={{marginTop:0}}>Life at {company.name}</h3>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:10}}>
                {((company.photos && company.photos.length ? company.photos : [
                  'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
                  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
                  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
                  'https://images.unsplash.com/photo-1556761175-4b46a572b786',
                  'https://images.unsplash.com/photo-1520880867055-1e30d1cb001c',
                  'https://images.unsplash.com/photo-1518600506278-4e8ef466b810'
                ])).slice(0,6).map((src, i) => (
                  <img key={i} src={`${src}?auto=format&fit=crop&w=400&q=60`} alt="life"
                    style={{width:'100%', height:120, objectFit:'cover', borderRadius:10}} />
                ))}
              </div>
              <div style={{color:'#667085', fontSize:13, marginTop:8}}>Photos are illustrative. Upload support coming soon.</div>
            </div>

            <h3 style={{ marginTop: 28, marginBottom: 12 }}>Open Positions</h3>
            {jobs.length === 0 ? (
              <p>No active job postings from this company.</p>
            ) : (
              jobs.map((job) => <JobCard key={job._id} job={job} />)
            )}
          </div>

          <aside>
            <div className="card" style={{ padding: 16, borderRadius:12 }}>
              <h3 style={{marginTop:0}}>Quick Facts</h3>
              <div style={{display:'grid', gap:6}}>
                <div><strong>Location:</strong> {company.location || '—'}</div>
                <div><strong>Size:</strong> {company.size || '—'}</div>
                <div><strong>Founded:</strong> {company.founded || '—'}</div>
                <div><strong>Open roles:</strong> {jobs.length}</div>
              </div>
            </div>
            <div className="card" style={{ padding: 16, marginTop:12, borderRadius:12 }}>
              <h3 style={{marginTop:0}}>Ratings</h3>
              {(() => {
                const rating = Number(company.rating || 0) || 0;
                const val = rating > 0 ? rating : 4.2; // placeholder if missing
                const stars = [1,2,3,4,5].map(i => i <= Math.round(val) ? '★' : '☆').join('');
                return (
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div style={{fontSize:20, color:'#f59e0b'}}>{stars}</div>
                    <div style={{color:'#475467'}}>{val.toFixed(1)} / 5</div>
                  </div>
                );
              })()}
              <div style={{color:'#667085', fontSize:14, marginTop:8}}>Ratings are community-provided. Feature coming soon.</div>
            </div>
          </aside>
        </div>

      </div>

      <Footer />
    </>
  );
}
