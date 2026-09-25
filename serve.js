// Tiny local preview server (not needed on Vercel)
const http = require("http");
const fs = require("fs");
const path = require("path");

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg" };

http
  .createServer((req, res) => {
    const url = req.url.split("?")[0];
    const file = path.join(__dirname, url === "/" ? "index.html" : url);
    if (!file.startsWith(__dirname)) return res.writeHead(403).end();
    fs.readFile(file, (err, data) => {
      if (err) return res.writeHead(404).end("Not found");
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(5174, () => console.log("http://localhost:5174"));
