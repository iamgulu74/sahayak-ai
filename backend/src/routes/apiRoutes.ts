import { Router } from "express";
import { handleVerifyDocument } from "../controllers/verifyDocumentController.js";
import {
  handleReportFraud,
  handleGetFraudStatus,
} from "../controllers/fraudReportController.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const apiRouter = Router();

// Health Check
apiRouter.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "sahayak-backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /api/verify-document",
      "POST /api/report-fraud",
      "GET /api/report-fraud",
      "GET /api/schemes",
      "GET /api/partners",
    ],
  });
});

// Verification Endpoint
apiRouter.post("/verify-document", handleVerifyDocument);

// Fraud Reporting Endpoints
apiRouter.post("/report-fraud", handleReportFraud);
apiRouter.get("/report-fraud", handleGetFraudStatus);

// Scheme Dataset Endpoint
apiRouter.get("/schemes", (req, res) => {
  try {
    const dataPath = path.resolve(__dirname, "../data/schemes.json");
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
      res.status(200).json({ success: true, count: data.length, data });
    } else {
      res.status(404).json({ success: false, error: "Schemes dataset not found" });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Channel Partners Dataset Endpoint
apiRouter.get("/partners", (req, res) => {
  try {
    const dataPath = path.resolve(__dirname, "../data/partners.json");
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
      res.status(200).json({ success: true, count: data.length, data });
    } else {
      res.status(404).json({ success: false, error: "Partners dataset not found" });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
