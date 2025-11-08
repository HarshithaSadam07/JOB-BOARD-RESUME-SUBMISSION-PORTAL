import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function Profile(){
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    title: "",
    location: "",
    email: "",
    phone: "",
    skills: [],
    experience: [],
    education: [],
    resumeUrl: ""
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/api/profile');
        setProfile(prev => ({
          ...prev,
          ...data,
          name: data.name || user.name,
          email: data.email || user.email
        }));
      } catch (err) {
        console.error('Error fetching profile:', err);
        alert('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const save = async () => {
    try {
      const { data } = await api.put('/api/profile', profile);
      setProfile(prev => ({
        ...prev,
        ...data
      }));
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if(!s) return;
    if(profile.skills.includes(s)) { setSkillInput(""); return; }
    setProfile(p => ({...p, skills:[...p.skills, s]}));
    setSkillInput("");
  };
  const removeSkill = (s) => setProfile(p => ({...p, skills: p.skills.filter(x=>x!==s)}));

  const addExperience = () => setProfile(p => ({...p, experience:[...p.experience, {company:"", role:"", from:"", to:"", desc:""}]}));
  const updateExperience = (i, k, v) => setProfile(p => ({...p, experience: p.experience.map((e,idx)=> idx===i? {...e,[k]:v}: e)}));
  const removeExperience = (i) => setProfile(p => ({...p, experience: p.experience.filter((_,idx)=> idx!==i)}));

  const addEducation = () => setProfile(p => ({...p, education:[...p.education, {school:"", degree:"", year:""}]}));
  const updateEducation = (i, k, v) => setProfile(p => ({...p, education: p.education.map((e,idx)=> idx===i? {...e,[k]:v}: e)}));
  const removeEducation = (i) => setProfile(p => ({...p, education: p.education.filter((_,idx)=> idx!==i)}));

  const onResumeFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await api.post('/api/upload/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfile(p => ({ ...p, resumeUrl: data.url }));
    } catch (err) {
      console.error('Error uploading resume:', err);
      alert('Failed to upload resume');
    }
  };

  return (
    <>
      <Navbar />
      <section className="container" style={{display:"grid", gridTemplateColumns:"1fr 360px", gap:24, padding:"24px 0"}}>
        <main className="card" style={{padding:16, borderRadius:12}}>
          <h2 style={{marginTop:0}}>Profile</h2>

          <div style={{display:"grid", gap:12}}>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
              <input className="input" placeholder="Full name" value={profile.name} onChange={e=>setProfile({...profile, name:e.target.value})} />
              <input className="input" placeholder="Title (e.g. Frontend Developer)" value={profile.title} onChange={e=>setProfile({...profile, title:e.target.value})} />
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
              <input className="input" placeholder="Location" value={profile.location} onChange={e=>setProfile({...profile, location:e.target.value})} />
              <input className="input" placeholder="Phone" value={profile.phone} onChange={e=>setProfile({...profile, phone:e.target.value})} />
            </div>
            <input className="input" placeholder="Email" value={profile.email} onChange={e=>setProfile({...profile, email:e.target.value})} />

            <div>
              <label style={{fontWeight:600}}>Skills</label>
              <div style={{display:"flex", gap:8, marginTop:6}}>
                <input className="input" placeholder="Add a skill" value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addSkill(); } }} />
                <button className="btn" type="button" onClick={addSkill}>Add</button>
              </div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:8}}>
                {profile.skills.map(s => (
                  <button key={s} className="pill" type="button" onClick={()=>removeSkill(s)}>{s} ×</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <label style={{fontWeight:600}}>Experience</label>
                <button className="btn tertiary" type="button" onClick={addExperience}>Add</button>
              </div>
              <div style={{display:"grid", gap:12, marginTop:8}}>
                {profile.experience.map((e, i) => (
                  <div key={i} className="card" style={{padding:12, borderRadius:10}}>
                    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                      <input className="input" placeholder="Company" value={e.company} onChange={ev=>updateExperience(i,'company',ev.target.value)} />
                      <input className="input" placeholder="Role" value={e.role} onChange={ev=>updateExperience(i,'role',ev.target.value)} />
                    </div>
                    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8}}>
                      <input className="input" placeholder="From (e.g. 2023-01)" value={e.from} onChange={ev=>updateExperience(i,'from',ev.target.value)} />
                      <input className="input" placeholder="To (e.g. 2024-05 or Present)" value={e.to} onChange={ev=>updateExperience(i,'to',ev.target.value)} />
                    </div>
                    <textarea className="input" placeholder="Description" value={e.desc} onChange={ev=>updateExperience(i,'desc',ev.target.value)} style={{marginTop:8}} />
                    <div style={{textAlign:'right'}}>
                      <button className="btn secondary" type="button" onClick={()=>removeExperience(i)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <label style={{fontWeight:600}}>Education</label>
                <button className="btn tertiary" type="button" onClick={addEducation}>Add</button>
              </div>
              <div style={{display:"grid", gap:12, marginTop:8}}>
                {profile.education.map((e, i) => (
                  <div key={i} className="card" style={{padding:12, borderRadius:10}}>
                    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                      <input className="input" placeholder="School/University" value={e.school} onChange={ev=>updateEducation(i,'school',ev.target.value)} />
                      <input className="input" placeholder="Degree" value={e.degree} onChange={ev=>updateEducation(i,'degree',ev.target.value)} />
                    </div>
                    <input className="input" placeholder="Graduation Year" value={e.year} onChange={ev=>updateEducation(i,'year',ev.target.value)} style={{marginTop:8}} />
                    <div style={{textAlign:'right'}}>
                      <button className="btn secondary" type="button" onClick={()=>removeEducation(i)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{fontWeight:600}}>Resume Preview (image/PDF name)</label>
              <div style={{display:"flex", gap:8, alignItems:"center", marginTop:6}}>
                <input className="input" placeholder="Resume URL or file name" value={profile.resumeUrl} onChange={e=>setProfile({...profile, resumeUrl:e.target.value})} />
                <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={onResumeFile} />
                <button className="btn" type="button" onClick={()=>fileRef.current?.click()}>Upload</button>
              </div>
              {profile.resumeUrl && profile.resumeUrl.startsWith('data:image') && (
                <img src={profile.resumeUrl} alt="resume" style={{marginTop:8, maxWidth:'100%', borderRadius:8}} />
              )}
            </div>

            <div>
              <button className="btn" type="button" onClick={save}>Save Profile</button>
            </div>
          </div>
        </main>

        <aside className="card" style={{padding:16, borderRadius:12}}>
          <h3 style={{marginTop:0}}>Profile Strength</h3>
          {(() => {
            const total = 6;
            let score = 0;
            if(profile.name && profile.title) score++;
            if(profile.location && profile.email) score++;
            if(profile.skills.length >= 5) score++;
            if(profile.experience.length >= 1) score++;
            if(profile.education.length >= 1) score++;
            if(profile.resumeUrl) score++;
            const pct = Math.round((score/total)*100);
            return (
              <div>
                <div style={{height:10, background:'#E8EDF5', borderRadius:8, overflow:'hidden'}}>
                  <div style={{height:'100%', width:`${pct}%`, background:'var(--accent,#DCD6F7)'}} />
                </div>
                <div style={{marginTop:8, color:'#667085'}}>{pct}% complete</div>
              </div>
            );
          })()}
        </aside>
      </section>
      <Footer />
    </>
  );
}
