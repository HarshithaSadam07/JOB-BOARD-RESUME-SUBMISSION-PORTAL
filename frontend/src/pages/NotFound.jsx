import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound(){
  return (
    <>
      <Navbar />
      <div className="container section">
        <div className="card">
          <h2>Page not found</h2>
          <p style={{marginTop:8}}>The page you are looking for does not exist.</p>
          <Link to="/" className="btn" style={{marginTop:12, display:"inline-block"}}>Go Home</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
