// require('dotenv').config()
// const Pool = require('pg').Pool
// console.log(process.env.DATABASE_URL)
// const db = pgp(process.env.DATABASE_URL)

require("dotenv").config();
const pgp = require("pg-promise")({});

const cn = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // "types" - in case you want to set custom type parsers on the pool level
};
const db = pgp(cn);

module.exports = db;

// const pool = new Pool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     port: process.env.DB_PORT,
//     host: process.env.DB_HOST
// })
