import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import * as gemini from "./src/services/geminiServer";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Gemini API Routes
  app.post("/api/gemini/extract", async (req, res) => {
    try {
      const { text } = req.body;
      const data = await gemini.extractResumeData(text);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/salary", async (req, res) => {
    try {
      const { candidate } = req.body;
      const data = await gemini.generateSalaryInsight(candidate);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/jobs", async (req, res) => {
    try {
      const { candidate } = req.body;
      const data = await gemini.matchJobs(candidate);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/improve-desc", async (req, res) => {
    console.log("Received request to improve job description");
    try {
      const { desc } = req.body;
      if (!desc) {
        return res.status(400).json({ error: "Description is required" });
      }
      const data = await gemini.improveJobDescription(desc);
      console.log("Successfully improved job description");
      res.json({ text: data });
    } catch (error: any) {
      console.error("Error in /api/gemini/improve-desc:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  app.post("/api/gemini/score", async (req, res) => {
    try {
      const { candidate } = req.body;
      const data = await gemini.calculateResumeScore(candidate);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Razorpay Order API
  app.post("/api/create-order", (req, res) => {
    const { amount, currency } = req.body;
    // Mocking order creation
    res.json({
      id: `order_${Math.random().toString(36).substring(7)}`,
      amount: amount * 100, // in paise
      currency: currency || "INR",
    });
  });

  app.post("/api/verify-payment", (req, res) => {
    // In a real app, verify signature with crypto
    // const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
