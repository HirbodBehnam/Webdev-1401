const db = require('../db');
const findFlightsWithDate = async (from, to, date, passengers) => {
    return db.any("SELECT * FROM available_offers WHERE origin = $1 AND destination = $2 AND date_trunc('day',departure_local_time) =  $3",
        [from, to, date ]);
};

const hasQueryAllParameters = (query) => {
    if(!query.origin){
        return {msg:"missing origin"};
    } else if( !query.destination){
        return {msg:"missing destination"};
    } else if( !query.departureDate){
        return {msg:"missing departureDate"};
    } else if(!query.passengers){
        return {msg:"missing passengers"};
    }
}

const isValidDate = (date) => {
    const date_regex = /^\d{4}-\d{2}-\d{2}$/;
    return date_regex.test(date);
}

const findFlights = async (req, res) => {
    console.log(req.query);
    let hasReturn = false;

    // check necessary parameters existence
    const parametersExistFailMsg = hasQueryAllParameters(req.query);
    if(parametersExistFailMsg)
        return res.json(parametersExistFailMsg);

    // check return date parameter existence
    if(req.query.returnDate)
        hasReturn = true;

    // extrcat query parameters
    let {origin, destination, departureDate, returnDate, passengers} = req.query;

    // date format validation
    if(!isValidDate(departureDate))
        return res.json({msg:"date must be in format YYYY-MM-DD"})

    if(hasReturn)
        if(!isValidDate(returnDate))
            return res.json({msg:"date must be in format YYYY-MM-DD"})

    // search flights
    const departFlights = await findFlightsWithDate(origin, destination, departureDate, passengers)

    if(hasReturn) {
        const returnFlights = await findFlightsWithDate(origin, destination, returnDate, passengers);
        return res.json({depart: departFlights, return: returnFlights});
    } else
        return res.json(departFlights)
}

module.exports = {
    findFlights
}