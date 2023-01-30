const db = require('../db');
const findFlightsWithDate = async (from, to, date, passengers) => {
    const query = "SELECT * FROM available_offers WHERE origin = $1 AND destination = $2 AND date_trunc('day',departure_local_time) =  $3";

    return db.any("SELECT * FROM available_offers WHERE origin = $1 AND destination = $2 AND date_trunc('day',departure_local_time) =  $3",
        [from, to, date ]).then((flights) => { console.log("flights", flights); return flights });
}
const findFlightsWithDeparture = async (req, res) => {
    const {from, to, departureDate, passengers} = req.params;
    const flights = await findFlightsWithDate(from, to, departureDate, passengers);
    res.json(flights)
}
const findFlightsWithDepartureAndReturn = async (req, res) => {
    const {from, to, departureDate, returnDate, passengers} = req.params;
}

module.exports = {
    findFlightsWithDeparture,
    findFlightsWithDepartureAndReturn
}