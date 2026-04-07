import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/page-info", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const response = await axios.get(url, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const title = $('title').text().trim() || 'No title found';
      const h1 = $('h1').first().text().trim() || 'No H1 found';
      const metaDescription = $('meta[name="description"]').attr('content')?.trim() || 
                             $('meta[property="og:description"]').attr('content')?.trim() || 
                             'No description found';
      
      // Fetch first meaningful paragraph
      const firstParagraph = $('p').filter((_, el) => $(el).text().trim().length > 50).first().text().trim() || 
                            $('p').first().text().trim() || 
                            'No content preview available';

      // Favicon detection
      let favicon = $('link[rel="shortcut icon"]').attr('href') || 
                    $('link[rel="icon"]').attr('href') || 
                    '/favicon.ico';
      
      if (favicon && !favicon.startsWith('http')) {
        const urlObj = new URL(url);
        favicon = new URL(favicon, urlObj.origin).href;
      }

      res.json({ title, h1, metaDescription, firstParagraph, favicon });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/check-link", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      // Use a short timeout to avoid hanging
      const response = await axios.get(url, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        validateStatus: () => true // Don't throw on error codes
      });
      res.json({ status: response.status });
    } catch (error: any) {
      res.json({ status: error.response?.status || 500, error: error.message });
    }
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
