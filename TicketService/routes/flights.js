const express = require("express");
const router = express.Router();
const flightsMiddleware = require("../middleware/flightsMiddleware");
// import the controller
const flightsController = require("../controllers/flightsController");

// define routes
router.get("/flights", ...flightsMiddleware, flightsController.findFlights);

module.exports = router;
