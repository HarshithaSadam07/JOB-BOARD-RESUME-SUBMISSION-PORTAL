import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

export default function JobCard({ job }) {
  const {
    _id,
    title,
    companyId,
    location,
    expLevel,
    type,
    salaryMin,
    salaryMax,
    skills = [],
    createdAt,
    applicantsCount,
    featured
  } = job;

  const isFeatured = Boolean(featured) || (Number(salaryMax || 0) >= 3000000); // 30LPA+ as featured
  const postedStr = createdAt ? new Date(createdAt).toLocaleDateString() : null;
  const key = _id || job.id;
  const [savedSet, setSavedSet] = useState(()=>{
    try { return new Set(JSON.parse(localStorage.getItem("saved_jobs") || "[]")); } catch { return new Set(); }
  });
  const isSaved = useMemo(()=> savedSet.has(key), [savedSet, key]);
  const toggleSave = () => {
    const next = new Set(savedSet);
    if(next.has(key)) next.delete(key); else next.add(key);
    setSavedSet(next);
    localStorage.setItem("saved_jobs", JSON.stringify(Array.from(next)));
    try{
      const existing = JSON.parse(localStorage.getItem("saved_jobs_meta") || "[]");
      let list = Array.isArray(existing) ? existing : [];
      if(next.has(key)){
        const snap = { _id: key, title, companyName: companyId?.name, location, type, expLevel };
        const idx = list.findIndex(x => (x._id || x.id) === key);
        if(idx >= 0) list[idx] = snap; else list.push(snap);
      } else {
        list = list.filter(x => (x._id || x.id) !== key);
      }
      localStorage.setItem("saved_jobs_meta", JSON.stringify(list));
    }catch{}
  };

  return (
    <div className="card" style={{ padding: 18, marginBottom: 14 }}>

      {/* Top Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0 }}>
            <Link to={`/jobs/${_id}`} className="link">
              {title}
            </Link>
          </h3>

          {companyId && (
            <Link
              to={`/company/${companyId._id || companyId}`}
              className="link"
              style={{ fontSize: 14 }}
            >
              {companyId.name || "Company"}
            </Link>
          )}

          {location && (
            <p style={{ marginTop: 4, color: "#555", fontSize: 14 }}>{location}</p>
          )}
        </div>

        {companyId?.logoUrl && (
          <img
            src={companyId.logoUrl}
            alt="logo"
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: 6
            }}
          />
        )}
      </div>

      {/* Meta Info */}
      <div style={{ display: "flex", gap: 10, margin: "8px 0", flexWrap: "wrap" }}>
        {expLevel && <span className="pill">{expLevel}</span>}
        {type && <span className="pill">{type}</span>}
        {salaryMin && salaryMax && (
          <span className="pill">
            ₹{salaryMin / 100000}L – ₹{salaryMax / 100000}L
          </span>
        )}
        {isFeatured && <span className="pill">Featured</span>}
        {postedStr && <span className="pill">Posted {postedStr}</span>}
        {typeof applicantsCount === 'number' && <span className="pill">Applicants: {applicantsCount}</span>}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          {skills.map((s, i) => (
            <span key={i} className="tag">{s}</span>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Link to={`/jobs/${_id}`} className="btn secondary">View Details</Link>
        <Link to={`/jobs/${_id}/apply`} className="btn">Apply</Link>
        <button type="button" className="btn tertiary" onClick={toggleSave}>{isSaved ? 'Saved' : 'Save'}</button>
      </div>
    </div>
  );
}
