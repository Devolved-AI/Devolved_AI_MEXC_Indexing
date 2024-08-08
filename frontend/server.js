const express = require("express");
const { createServer } = require("https");
const next = require("next");
const fs = require("fs");
const cors = require("cors");
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Use cors middleware
  server.use(cors({
    origin: "*", // or a specific origin
    methods: ['POST'],
  }));

  let httpsOptions = {};
  if (dev) {
    httpsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH_DEV),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH_DEV),
    };
  } else {
    httpsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    };
  }

  // Custom API route handler
  server.post('/api/transactions', (req, res) => {
    handle(req, res);
  });

  // Handle all other routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Create HTTPS server
  const httpsServer = createServer(httpsOptions, server);

  httpsServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://${dev ? "localhost" : process.env.POSTGRES_HOST}:${port}`);
  });
});
