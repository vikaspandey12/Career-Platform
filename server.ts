import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
