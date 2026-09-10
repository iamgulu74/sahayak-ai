import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiRouter } from "./routes/apiRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser with 50mb limit to handle document image base64 payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount API routes
app.use("/api", apiRouter);

// Root fallback
app.get("/", (req, res) => {
  res.json({
    message: "Sahayak AI — Backend REST API Server",
    status: "online",
    docs: "/api/health",
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Sahayak AI Backend Server running on port ${PORT}`);
  console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Verify Endpoint: http://localhost:${PORT}/api/verify-document`);
  console.log(`🚨 Fraud Endpoint: http://localhost:${PORT}/api/report-fraud`);
  console.log(`=================================================`);
});

export default app;
