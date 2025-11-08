import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import companyRoutes from "./routes/company.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import uploadLogoRoutes from "./routes/uploadLogo.routes.js";
import profileRoutes from "./routes/profile.routes.js";


dotenv.config();
const app = express();  // ✅ app defined BEFORE app.use()

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => res.send("Backend running ✅"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/upload", uploadLogoRoutes);
app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 5000;

console.log("🔄 Server file loaded");

async function seedAdminOnBoot(){
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log("ℹ️ Admin user already exists");
      return;
    }
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.log("ℹ️ Skipping admin seed: ADMIN_EMAIL/ADMIN_PASSWORD not set");
      return;
    }
    const user = await User.create({
      name: ADMIN_NAME || 'Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin'
    });
    console.log(`✅ Seeded admin: ${user.email}`);
  } catch (e) {
    console.error("❌ Failed to seed admin:", e.message);
  }
}

connectDB().then(async () => {
  await seedAdminOnBoot();
  app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
});
