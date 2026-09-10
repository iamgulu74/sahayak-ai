import { Request, Response } from "express";
import { processDocumentVerification } from "../services/verificationEngine.js";

export async function handleVerifyDocument(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body;
    if (!body || !body.image) {
      res.status(400).json({
        success: false,
        error: "Image data is required for document verification",
      });
      return;
    }

    const result = await processDocumentVerification(body);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Document verification error in backend controller:", error);
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      error: error.message || "Document verification failed",
    });
  }
}
