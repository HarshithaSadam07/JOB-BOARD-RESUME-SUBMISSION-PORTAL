import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FileUpload from "../components/FileUpload";
import api from "../api/axios";

export default function Apply(){
  const { id } = useParams(); // jobId
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!file) return setMsg("Please attach a resume (PDF).");

    try {
      const fd = new FormData();
      fd.append("resume", file);
      fd.append("coverLetter", coverLetter);
      const { data } = await api.post(`/applications/jobs/${id}/apply`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMsg("Applied successfully!");
      setTimeout(()=>nav("/applications"), 700);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to apply");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container section" style={{maxWidth:640}}>
        <h2 style={{marginBottom:12}}>Apply to Job</h2>
        <form className="card" onSubmit={submit} style={{display:"grid", gap:12}}>
          <label>Resume (PDF)</label>
          <FileUpload onFile={setFile} accept="application/pdf" />
          <label>Cover Letter (optional)</label>
          <textarea rows={5} className="input" value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} />
          {msg && <div style={{color: msg.includes("success") ? "#15803d" : "#b91c1c"}}>{msg}</div>}
          <button className="btn" type="submit">Submit Application</button>
        </form>
      </div>
      <Footer />
    </>
  );
}
