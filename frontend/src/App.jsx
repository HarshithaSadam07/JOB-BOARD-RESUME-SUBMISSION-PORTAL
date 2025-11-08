import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Apply from "./pages/Apply";
import MyApplications from "./pages/MyApplications";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import PostJob from "./pages/PostJob";           
import Companies from "./pages/Companies";
import CompanyPage from "./pages/CompanyPage";
import AdminPanel from "./pages/AdminPanel";
import MyJobs from "./pages/MyJobs";
import NotFound from "./pages/NotFound";
import SearchJobs from "./pages/SearchJobs";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import AboutUs from "./pages/AboutUs";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Jobs */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/search" element={<SearchJobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route
            path="/jobs/:id/apply"
            element={
              <ProtectedRoute roles={["candidate"]}>
                <Apply />
              </ProtectedRoute>
            }
          />

          {/* Candidate */}
          <Route
            path="/applications"
            element={
              <ProtectedRoute roles={["candidate"]}>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route path="/saved" element={<SavedJobs />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["candidate"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute roles={["candidate"]}>
                <Alerts />
              </ProtectedRoute>
            }
          />

          {/* Recruiter / Admin */}
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute roles={["recruiter", "admin"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />

          {/* My Jobs */}
          <Route
            path="/recruiter/jobs"
            element={
              <ProtectedRoute roles={["recruiter", "admin"]}>
                <MyJobs />
              </ProtectedRoute>
            }
          />

          {/* Post Job */}
          <Route
            path="/recruiter/post"
            element={
              <ProtectedRoute roles={["recruiter", "admin"]}>
                <PostJob />
              </ProtectedRoute>
            }
          />


          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Companies */}
          <Route path="/companies" element={<Companies />} />
          <Route path="/company/:id" element={<CompanyPage />} />
          <Route path="/about" element={<AboutUs />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
