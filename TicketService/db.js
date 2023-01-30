require('dotenv').config()
const pgp = require('pg-promise')({})
// console.log(process.env.DATABASE_URL)
// const db = pgp(process.env.DATABASE_URL)
const cn = {
    host: 'localhost',
    port: 5432,
    database: 'ticketservice',
    user: 'postgres',
    password: 'postgres',
    // "types" - in case you want to set custom type parsers on the pool level
};
const db = pgp(cn)
module.exports = db;