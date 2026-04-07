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
      const title = $('title').text().trim() || 
                    $('meta[property="og:title"]').attr('content')?.trim() || 
                    $('meta[name="twitter:title"]').attr('content')?.trim() || 
                    'No title found';
      
      const h1 = $('h1').first().text().trim() || 
                 $('h2').first().text().trim() || 
                 'No heading found';
      
      const metaDescription = $('meta[name="description"]').attr('content')?.trim() || 
                             $('meta[property="og:description"]').attr('content')?.trim() || 
                             $('meta[name="twitter:description"]').attr('content')?.trim() || 
                             'No description found';
      
      // Fetch first meaningful paragraph
      const firstParagraph = $('p').filter((_, el) => {
        const text = $(el).text().trim();
        return text.length > 60 && !text.includes('cookie') && !text.includes('javascript');
      }).first().text().trim() || 
      $('p').first().text().trim() || 
      'No content preview available';

      // Favicon detection
      let favicon = $('link[rel="apple-touch-icon"]').attr('href') ||
                    $('link[rel="shortcut icon"]').attr('href') || 
                    $('link[rel="icon"]').attr('href') || 
                    $('link[rel*="icon"]').attr('href') ||
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

    console.log(`Checking link: ${url}`);
    try {
      // Try HEAD request first as it's lighter
      const response = await axios.head(url, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        validateStatus: () => true
      });
      
      // If HEAD fails or returns 405/403, try GET
      if (response.status >= 400) {
        const getResponse = await axios.get(url, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          validateStatus: () => true
        });
        console.log(`Link check (GET) result for ${url}: ${getResponse.status}`);
        return res.json({ status: getResponse.status });
      }

      console.log(`Link check (HEAD) result for ${url}: ${response.status}`);
      res.json({ status: response.status });
    } catch (error: any) {
      console.error(`Error checking link ${url}:`, error.message);
      res.json({ 
        status: error.response?.status || 500, 
        error: error.message,
        details: "Could not reach the server. It might be blocking automated requests or is currently offline."
      });
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
