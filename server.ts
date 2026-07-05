import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to dispatch real SMS
  app.post("/api/send-sms", async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: phone and message are mandatory." 
      });
    }

    // Sanitize the phone number
    let cleanPhone = phone.trim().replace(/[^0-9+]/g, "");
    
    // If phone doesn't have country code and is 10 digits (common for India), prefix with +91 or 91 based on provider requirements
    if (cleanPhone.length === 10) {
      cleanPhone = `+91${cleanPhone}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
      cleanPhone = `+${cleanPhone}`;
    }

    // 1. Try Fast2SMS gateway if configured (highly requested for India)
    const fast2SmsKey = process.env.FAST2SMS_API_KEY;
    if (fast2SmsKey) {
      try {
        console.log(`[SMS] Dispatched via Fast2SMS to ${cleanPhone}`);
        const fastPhone = cleanPhone.replace("+", "");
        
        const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            "authorization": fast2SmsKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            route: "q",
            message: message,
            language: "english",
            flash: 0,
            numbers: fastPhone,
          }),
        });

        const data = await response.json();
        if (data.return) {
          return res.json({ 
            success: true, 
            gateway: "Fast2SMS", 
            messageId: data.request_id || "F2S-REQ",
            details: data.message || "Message sent successfully" 
          });
        } else {
          console.error("[SMS] Fast2SMS Error:", data);
          return res.status(400).json({ 
            success: false, 
            error: data.message || "Fast2SMS rejected the request." 
          });
        }
      } catch (err: any) {
        console.error("[SMS] Fast2SMS Exception:", err);
        return res.status(500).json({ 
          success: false, 
          error: `Fast2SMS Integration failure: ${err.message}` 
        });
      }
    }

    // 2. Try Twilio if configured
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (twilioSid && twilioAuthToken && twilioFrom) {
      try {
        console.log(`[SMS] Dispatched via Twilio to ${cleanPhone}`);
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        
        const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString("base64");
        
        const params = new URLSearchParams();
        params.append("To", cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`);
        params.append("From", twilioFrom);
        params.append("Body", message);

        const response = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        const data = await response.json();
        if (response.ok) {
          return res.json({ 
            success: true, 
            gateway: "Twilio", 
            messageId: data.sid, 
            details: `Twilio SMS queued successfully. Status: ${data.status}` 
          });
        } else {
          console.error("[SMS] Twilio Error:", data);
          return res.status(400).json({ 
            success: false, 
            error: data.message || "Twilio gateway rejected the message." 
          });
        }
      } catch (err: any) {
        console.error("[SMS] Twilio Exception:", err);
        return res.status(500).json({ 
          success: false, 
          error: `Twilio Integration failure: ${err.message}` 
        });
      }
    }

    // 3. Fallback / Warning when no SMS Gateway keys are defined
    return res.status(400).json({
      success: false,
      error: "No active SMS Gateway API keys configured. Please add FAST2SMS_API_KEY or Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) to your environment variables in the Settings menu.",
      isConfigRequired: true
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
