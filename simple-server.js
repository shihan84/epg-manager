import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('public'));

// Proxy API requests to Next.js
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
  })
);

// Serve the main page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>EPG Manager</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
      <h1>EPG Manager</h1>
      <p>Server is running on port ${PORT}</p>
      <p><a href="/auth/signin">Sign In</a></p>
      <p><a href="/dashboard">Dashboard</a></p>
      <p><a href="/channels">Channels</a></p>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`EPG Manager server running on http://localhost:${PORT}`);
});
