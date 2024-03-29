const fs = require('fs');
const https = require("https");
require("dotenv").config();

const express = require("express");

const app = express();

// import routes
const flightsRoute = require("./routes/flights");
const purchasesRoute = require("./routes/purchases");

// use middleware to access req body
app.use(express.json());

// routes
app.use(flightsRoute);
app.use(purchasesRoute);

let server;
try {
  const sslOptions = {
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/cert.pem')
  };
  server = https.createServer(sslOptions, app);
} catch (err) {
  server = app;
}

// listen on port
server.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
