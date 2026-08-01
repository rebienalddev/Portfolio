const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 10000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.json': 'application/json'
};

http.createServer((req, res) => {
    // Dynamically serve /env.js populated from Render's Environment Variables
    if (req.url === '/env.js' || req.url === 'env.js') {
        const envJsContent = `window.ENV = {
    GROQ_API_KEY: ${JSON.stringify(process.env.GROQ_API_KEY || '')},
    GEMINI_API_KEY: ${JSON.stringify(process.env.GEMINI_API_KEY || '')},
    NEXT_PUBLIC_SUPABASE_URL: ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || '')},
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '')}
};`;
        res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
        return res.end(envJsContent);
    }

    // Prevent directory traversal
    const safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(__dirname, safePath === '/' ? 'index.html' : safePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            // Serve index.html as fallback for SPA routing
            fs.readFile(path.join(__dirname, 'index.html'), (indexErr, indexContent) => {
                if (indexErr) {
                    res.writeHead(404);
                    res.end('File Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(indexContent);
                }
            });
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}).listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
