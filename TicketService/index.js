require('dotenv').config();

const express = require('express');
const app = express();

const flightsRoute =  require('./routes/flights')

// use middleware to access req body
app.use(express.json());
app.use((req, res, next)=>{
  console.log(req.params);
  next();
})

// routes
app.use(flightsRoute)

// listen on port
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
})