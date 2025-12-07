import express from "express";
import cors from "cors";
import Replicate from "replicate";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

dotenv.config();
const app = express();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// ✅ Rate limiter - track requests
let requestCount = 0;
let resetTime = Date.now();

const checkRateLimit = () => {
  const now = Date.now();
  
  // Reset counter every minute
  if (now - resetTime > 60000) {
    requestCount = 0;
    resetTime = now;
  }
  
  // Allow max 5 requests per minute (leave 1 as buffer)
  if (requestCount >= 5) {
    return false;
  }
  
  requestCount++;
  return true;
};

// ✅ Retry with exponential backoff
const replicateWithRetry = async (dataUrl, maxRetries = 2) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const output = await replicate.run(
        "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
        { input: { image: dataUrl } }
      );
      return output;
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '10');
        console.log(`Rate limited. Waiting ${retryAfter}s before retry ${i + 1}/${maxRetries}...`);
        
        if (i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, retryAfter * 1000));
        } else {
          throw error; // Give up after max retries
        }
      } else {
        throw error;
      }
    }
  }
};

app.post("/remove-background", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    console.log("File received:", req.file.path);

    // ✅ Check rate limit before processing
    if (!checkRateLimit()) {
      fs.unlinkSync(req.file.path);
      return res.status(429).json({ 
        error: "rate_limit", 
        message: "Too many requests. Please wait a minute." 
      });
    }

    // Read file as base64
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64 = fileBuffer.toString("base64");

    const mime = req.file.mimetype === "image/png" ? "image/png" : "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64}`;

    let output;

    try {
      // ✅ Use retry logic
      output = await replicateWithRetry(dataUrl);
    } catch (apiError) {
      console.log("Replicate error:", apiError);
      fs.unlinkSync(req.file.path);
      
      // Return original image on failure
      return res.json({ 
        result: null, 
        error: "replicate_failed",
        fallback: true 
      });
    }

    // Clean temp file
    fs.unlinkSync(req.file.path);

    return res.json({ result: output?.url?.href ?? null });
  } catch (err) {
    console.log("BG REMOVE ERROR:", err);
    
    // Clean up temp file if it exists
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    
    return res.status(500).json({ error: "server_failed" });
  }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));