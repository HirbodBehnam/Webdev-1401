require('dotenv').config();

const express = require('express');
const app = express();


// use middleware to access req body
app.use(express.json());

// routes

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
})