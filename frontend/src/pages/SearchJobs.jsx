import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SearchJobs(){
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const page = parseInt(params.get("page") || "1", 10);
  const q = params.get("q") || "";
  const location = params.get("location") || "";
  const company = params.get("company") || "";
  const exp = params.get("exp") || "";
  const type = params.get("type") || "";
  const sort = params.get("sort") || "date";
  const minSalary = params.get("minSalary") || "";
  const maxSalary = params.get("maxSalary") || "";
  const mode = params.get("mode") || "infinite"; // default to infinite scroll
  const featuredOnly = params.get("featured") || ""; // truthy => featured only
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [saved, setSaved] = useState(()=>{
    try { return new Set(JSON.parse(localStorage.getItem("saved_jobs") || "[]")); } catch { return new Set(); }
  });
  const [savedSearches, setSavedSearches] = useState([]);
  const [recent, setRecent] = useState([]);

  const query = useMemo(()=>({ q, location, company, exp, type, sort, minSalary, maxSalary, featuredOnly, page, mode }), [q, location, company, exp, type, sort, minSalary, maxSalary, featuredOnly, page, mode]);

  const updateParam = (k, v) => {
    const next = new URLSearchParams(params);
    if(v === undefined || v === null || v === "") next.delete(k); else next.set(k, v);
    if(k !== "page") next.set("page", "1");
    setParams(next);
  };

  useEffect(()=>{
    try { setSavedSearches(JSON.parse(localStorage.getItem('saved_searches') || '[]')); } catch { setSavedSearches([]); }
    try { setRecent(JSON.parse(localStorage.getItem('recent_jobs') || '[]')); } catch { setRecent([]); }
  },[]);

  const persistSavedSearches = (list) => {
    setSavedSearches(list);
    localStorage.setItem('saved_searches', JSON.stringify(list));
  };

  const saveCurrentSearch = () => {
    const nameParts = [q, company, location].filter(Boolean);
    const name = nameParts.join(' • ') || 'Search';
    const item = {
      id: Date.now().toString(),
      name,
      params: { q, location, company, exp, type, sort, minSalary, maxSalary, featured: featuredOnly }
    };
    const next = [item, ...savedSearches].slice(0, 20);
    persistSavedSearches(next);
  };

  const applySavedSearch = (item) => {
    const next = new URLSearchParams();
    Object.entries(item.params || {}).forEach(([k, v]) => { if(v) next.set(k, String(v)); });
    next.set('page','1');
    setParams(next);
  };

  const deleteSavedSearch = (id) => {
    persistSavedSearches(savedSearches.filter(s => s.id !== id));
  };

  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem('recent_jobs');
  };

  const createAlertFromSearch = () => {
    try{
      const alerts = JSON.parse(localStorage.getItem('job_alerts') || '[]');
      const item = { id: Date.now().toString(), keywords: q || '', location: location || '', frequency: 'daily' };
      const next = [item, ...alerts].slice(0, 50);
      localStorage.setItem('job_alerts', JSON.stringify(next));
      alert('Alert created for current search');
    }catch{}
  };

  useEffect(()=>{
    const run = async ()=>{
      setLoading(true); setError("");
      try {
        const resp = await api.get("/jobs", { params: { q, location, company, exp, type, sort, minSalary, maxSalary, featured: featuredOnly, page, limit: pageSize } });
        let list = resp.data?.data || resp.data || [];
        const isFeatured = (j) => Boolean(j.featured) || Number(j.salaryMax || 0) >= 3000000;
        if (featuredOnly) list = list.filter(isFeatured);
        if (sort === 'featured') list = [...list].sort((a,b)=> (isFeatured(b)-isFeatured(a)) || (Number(b.salaryMax||0)-Number(a.salaryMax||0)) );
        if(mode === 'infinite' && page > 1){
          setJobs(prev => Array.isArray(prev) ? [...prev, ...list] : list);
        } else {
          setJobs(list);
        }
        const t = resp.data?.total ?? resp.headers["x-total-count"] ?? 0;
        setTotal(Number(t));
      } catch(e){
        setError(e?.response?.data?.message || "Failed to load jobs");
      } finally { setLoading(false); }
    };
    run();
  }, [query]);

  const toggleSave = (id) => {
    const next = new Set(saved);
    if(next.has(id)) next.delete(id); else next.add(id);
    setSaved(next);
    localStorage.setItem("saved_jobs", JSON.stringify(Array.from(next)));
    try {
      const existing = JSON.parse(localStorage.getItem("saved_jobs_meta") || "[]");
      let list = Array.isArray(existing) ? existing : [];
      if(next.has(id)){
        const job = jobs.find(x => (x._id || x.id) === id);
        if(job){
          // upsert snapshot
          const idx = list.findIndex(x => (x._id || x.id) === id);
          const snap = { _id: job._id || job.id, title: job.title || job.role, companyName: job.companyName || job.company?.name, location: job.location || job.city || job.country, type: job.type, expLevel: job.expLevel };
          if(idx >= 0) list[idx] = snap; else list.push(snap);
        }
      } else {
        list = list.filter(x => (x._id || x.id) !== id);
      }
      localStorage.setItem("saved_jobs_meta", JSON.stringify(list));
    } catch {}
  };

  const totalPages = Math.max(1, Math.ceil((total || (jobs?.length < pageSize ? (page-1)*pageSize + jobs.length : page*pageSize)) / pageSize));

  const active = useMemo(()=>{
    const items = [];
    if(q) items.push({k:"q", label:`Keyword: ${q}`});
    if(location) items.push({k:"location", label:`Location: ${location}`});
    if(company) items.push({k:"company", label:`Company: ${company}`});
    if(exp) items.push({k:"exp", label:`Exp: ${exp}`});
    if(type) items.push({k:"type", label:`Type: ${type}`});
    if(minSalary) items.push({k:"minSalary", label:`Min ₹${minSalary}`});
    if(maxSalary) items.push({k:"maxSalary", label:`Max ₹${maxSalary}`});
    if(sort && sort !== 'date') items.push({k:"sort", label:`Sort: ${sort}`});
    return items;
  }, [q, location, company, exp, type, minSalary, maxSalary, sort]);

  const clearOne = (k) => updateParam(k, "");

  // Infinite scroll observer
  const sentinelRef = useRef(null);
  useEffect(()=>{
    if(mode !== 'infinite') return;
    const node = sentinelRef.current;
    if(!node) return;
    const obs = new IntersectionObserver(entries => {
      const first = entries[0];
      if(first.isIntersecting && !loading && page < totalPages){
        updateParam('page', String(page+1));
      }
    }, { root: null, rootMargin: '0px', threshold: 1.0 });
    obs.observe(node);
    return () => obs.disconnect();
  }, [mode, loading, page, totalPages]);

  return (
    <>
      <Navbar />
      <section className="container" style={{display:"grid", gridTemplateColumns:"280px 1fr", gap:24, paddingTop:24, paddingBottom:24}}>
        <aside className="card" style={{padding:16, borderRadius:12}}>
          <h2 style={{marginTop:0}}>Filters</h2>
          <div style={{background:'var(--surface-2,#F4EEFF)', padding:12, borderRadius:8, marginBottom:12}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
              <strong>Saved Searches</strong>
              <button className="btn tertiary" type="button" onClick={saveCurrentSearch}>Save current</button>
            </div>
            <div style={{display:'grid', gap:8, marginTop:8}}>
              {savedSearches.length === 0 && <div style={{color:'#667085'}}>No saved searches.</div>}
              {savedSearches.map(s => (
                <div key={s.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                  <div style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={s.name}>{s.name}</div>
                  <div style={{display:'flex', gap:6}}>
                    <button className="btn secondary" type="button" onClick={()=>applySavedSearch(s)}>Apply</button>
                    <button className="btn tertiary" type="button" onClick={()=>deleteSavedSearch(s.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:'var(--surface-2,#F4EEFF)', padding:12, borderRadius:8, marginBottom:12}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
              <strong>Recently Viewed</strong>
              {recent.length > 0 && <button className="btn tertiary" type="button" onClick={clearRecent}>Clear</button>}
            </div>
            <div style={{display:'grid', gap:8, marginTop:8}}>
              {recent.length === 0 && <div style={{color:'#667085'}}>No recent jobs.</div>}
              {recent.map(r => (
                <div key={r.id} style={{display:'grid', gap:2}}>
                  <Link to={`/jobs/${r.id}`} style={{fontWeight:600}}>{r.title}</Link>
                  <div style={{color:'#667085', fontSize:13}}>{r.companyName || 'Company'} • {r.location || 'Location'}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"grid", gap:12}}>
            <input className="input" placeholder="Search jobs" value={q} onChange={e=>updateParam("q", e.target.value)} />
            <input className="input" placeholder="Location" value={location} onChange={e=>updateParam("location", e.target.value)} />
            <input className="input" placeholder="Company" value={company} onChange={e=>updateParam("company", e.target.value)} />
            <select className="input" value={exp} onChange={e=>updateParam("exp", e.target.value)}>
              <option value="">Experience</option>
              <option value="0-1">0-1 Years</option>
              <option value="1-3">1-3 Years</option>
              <option value="3-5">3-5 Years</option>
              <option value="5-8">5-8 Years</option>
              <option value="8-15">8-15 Years</option>
            </select>
            <select className="input" value={type} onChange={e=>updateParam("type", e.target.value)}>
              <option value="">Job Type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <input className="input" type="number" min="0" placeholder="Min Salary" value={minSalary} onChange={e=>updateParam("minSalary", e.target.value)} />
              <input className="input" type="number" min="0" placeholder="Max Salary" value={maxSalary} onChange={e=>updateParam("maxSalary", e.target.value)} />
            </div>
            <select className="input" value={sort} onChange={e=>updateParam("sort", e.target.value)}>
              <option value="date">Newest</option>
              <option value="relevance">Relevance</option>
              <option value="featured">Featured</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={!!featuredOnly} onChange={e=>updateParam('featured', e.target.checked ? '1' : '')} />
              Featured only
            </label>
            <button className="btn secondary" type="button" onClick={()=>{
              setParams(new URLSearchParams());
            }}>Clear</button>
          </div>
        </aside>
        <main>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
            <h2 style={{margin:0}}>Jobs</h2>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <button className="btn tertiary" type="button" onClick={createAlertFromSearch}>Create Alert</button>
              <div style={{color:"var(--muted,#667085)"}}>{total ? `${total} results` : null}</div>
              <button className="btn tertiary" type="button" onClick={()=>updateParam('mode', mode==='infinite' ? '' : 'infinite')}>
                {mode==='infinite' ? 'Use Pagination' : 'Use Infinite Scroll'}
              </button>
            </div>
          </div>
          {active.length > 0 && (
            <div style={{display:"flex", flexWrap:"wrap", gap:8, marginBottom:12}}>
              {active.map(it => (
                <button key={it.k} className="pill" style={{display:"inline-flex", alignItems:"center", gap:6}}
                  onClick={()=>clearOne(it.k)} type="button">
                  {it.label}
                  <span style={{fontWeight:700}}>×</span>
                </button>
              ))}
              <button className="btn tertiary" type="button" onClick={()=>setParams(new URLSearchParams())}>Clear All</button>
            </div>
          )}
          {loading && (
            <div style={{display:"grid", gap:12}}>
              {Array.from({length:6}).map((_,i)=> (
                <div key={i} className="card" style={{padding:16, borderRadius:12}}>
                  <div style={{display:"flex", justifyContent:"space-between", gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{height:20, width:"40%", background:"#EEF2F7", borderRadius:8}} />
                      <div style={{height:14, width:"60%", background:"#F2F4F7", borderRadius:7, marginTop:8}} />
                    </div>
                    <div style={{display:"flex", gap:8, alignItems:"center"}}>
                      <div style={{height:24, width:80, background:"#F4EEFF", borderRadius:999}} />
                      <div style={{height:24, width:80, background:"#F4EEFF", borderRadius:999}} />
                    </div>
                  </div>
                  <div style={{height:12, background:"#F2F4F7", borderRadius:6, marginTop:12}} />
                  <div style={{display:"flex", gap:8, marginTop:12}}>
                    <div style={{height:36, width:80, background:"#EEF2F7", borderRadius:8}} />
                    <div style={{height:36, width:80, background:"#EEF2F7", borderRadius:8}} />
                    <div style={{height:36, width:80, background:"#EEF2F7", borderRadius:8}} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && <div className="card" style={{color:'#dc2626'}}>{error}</div>}
          {!loading && !error && (
            <div style={{display:"grid", gap:12}}>
              {jobs?.length === 0 && <div className="card">No jobs found</div>}
              {jobs?.map(j => (
                <div key={j._id || j.id} className="card" style={{padding:16, borderRadius:12}}>
                  <div style={{display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
                    <div>
                      <div style={{fontWeight:600, color:"var(--primary-text,#424874)"}}>{j.title || j.role || "Job"}</div>
                      <div style={{color:"var(--muted,#667085)"}}>{j.companyName || j.company?.name || "Company"} • {j.location || j.city || j.country || "Location"}</div>
                    </div>
                    <div style={{display:"flex", gap:8, alignItems:"center"}}>
                      <span className="pill">{j.type || "Full-time"}</span>
                      {j.expLevel && <span className="pill">{j.expLevel}</span>}
                      {j.salary && <span className="pill">{j.salary}</span>}
                      {sort === 'relevance' && <span className="pill">Relevant</span>}
                      {j.createdAt && ((Date.now() - new Date(j.createdAt).getTime()) < 7*24*60*60*1000) && <span className="pill">New</span>}
                    </div>
                  </div>
                  <p style={{marginTop:8, color:"#475467"}}>{j.description ? String(j.description).slice(0,160) + (String(j.description).length>160?"...":"") : ""}</p>
                  <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:8}}>
                    {(j.skills || []).slice(0,3).map((s, i) => (
                      <span key={i} className="pill" style={{background:'#F4EEFF'}}>{s}</span>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:8}}>
                    <Link className="btn" to={`/jobs/${j._id || j.id}`}>View</Link>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={()=>toggleSave(j._id || j.id)}
                      style={ saved.has(j._id || j.id) ? { background: "var(--accent,#DCD6F7)", color: "var(--primary-text,#424874)" } : undefined }
                    >{ saved.has(j._id || j.id) ? "Saved" : "Save" }</button>
                    <button className="btn tertiary" type="button">Apply</button>
                  </div>
                </div>
              ))}
              {mode==='infinite' && (
                <div ref={sentinelRef} style={{height:1}} />
              )}
            </div>
          )}
          {mode!== 'infinite' && (
            <div style={{display:"flex", justifyContent:"center", gap:8, marginTop:16}}>
              <button className="btn secondary" disabled={page<=1} onClick={()=>updateParam("page", String(page-1))}>Prev</button>
              <div className="pill">Page {page} / {totalPages}</div>
              <button className="btn secondary" disabled={page>=totalPages} onClick={()=>updateParam("page", String(page+1))}>Next</button>
            </div>
          )}
        </main>
      </section>
      <Footer />
    </>
  );
}
