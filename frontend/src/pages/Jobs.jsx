import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import api from "../api/axios";

export default function Jobs(){
  const [jobs, setJobs] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/jobs", q ? { params:{ q } } : undefined);
      setJobs(data?.items || data || []);
    })();
  }, [q]);

  return (
    <>
      <Navbar />
      <div className="container section">
        <div className="card" style={{marginBottom:16}}>
          <input className="input" placeholder="Search job title, skill, location..."
                 value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <div className="grid cols-3">
          {jobs.map(j => <JobCard key={j._id} job={j} />)}
        </div>
      </div>
      <Footer />
    </>
  );
}
