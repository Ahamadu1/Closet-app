// bgremover.js (server)
import express from "express";
import cors from "cors";
import Replicate from "replicate";
import dotenv from "dotenv";
import multer from "multer";
import path  from "path";
import fs from 'fs'
import { readFile } from "node:fs/promises";

const app = express();
dotenv.config();
if (!process.env.REPLICATE_API_TOKEN) {
    console.error("Missing REPLICATE_API_TOKEN in .env");
    process.exit(1);
  }
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

app.use(cors({
    origin: ['http://localhost:8081', 'http://10.0.2.2:8081', 'http://localhost:19006'],
    credentials: true
}));
  
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

  
  app.post('/remove-background', upload.single('image'), async (req, res) => {
    try {


        const imgpath = "/Users/ahamadu/CLOSET_APP/assets/LESHIRT.png"
        const imageBuffer = await readFile(imgpath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = imgpath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64Image}`;
    


        console.log('Request body keys:', Object.keys(req.body || {}));
        console.log('Request files:', req.file ? 'File present' : 'No file');
        console.log('Content-Type:', req.get('Content-Type'));
        console.log('Received remove-background request');
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      
      console.log("url", req.body.url)
      console.log('File details:', {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
    });

  
      
    // const imageBuffer = await fs.promises.readFile(req.file.path);
    //   console.log("image buffer",imageBuffer)
  
    //   const output = await replicate.run(
    //     "rembg/rembg:1.4.1",
    //     {
    //         input: { image: fs.createReadStream(req.file.path) }
    //     }
    //   );
    
    const output = await replicate.run("851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc", { input:{ image: dataUrl }});

    
    console.log("Image URL::", output.url().href);
   
    console.log('Replicate response received:', typeof output);
  
      // Clean up uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.log('Error deleting temp file:', err);
        else console.log('Temp file deleted successfully');
      });
  
      const result = output.url().href
      console.log("resukt",result)
      return res.json({ result });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Background removal failed' });
    }
  });
  
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });