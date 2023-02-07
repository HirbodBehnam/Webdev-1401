const { validationResult } = require("express-validator");
const db = require("../db");

const findFlightsWithDate = async (from, to, date) =>
  db.any(
    "SELECT * FROM available_offers WHERE origin = $1 AND destination = $2 AND date_trunc('day',departure_local_time) =  $3",
    [from, to, date]
  );

const findFlights = async (req, res) => {
  // extract query parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }

  const { origin, destination, departureDate, returnDate } = req.query;

  // search flights
  const departFlights = await findFlightsWithDate(
    origin,
    destination,
    departureDate
  );

  if (req.hasReturn) {
    const returnFlights = await findFlightsWithDate(
      destination,
      origin,
      returnDate
    );
    return res.json({ depart: departFlights, return: returnFlights });
  }
  return res.json(departFlights);
};

module.exports = {
  findFlights,
};
