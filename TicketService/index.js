require('dotenv').config();

const express = require('express');

const app = express();

// import routes
const flightsRoute = require('./routes/flights');
const purchasesRoute = require('./routes/purchases');

// use middleware to access req body
app.use(express.json());

// routes
app.use(flightsRoute);
app.use(purchasesRoute);

// listen on port
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
