const express = require('express');
const router = express.Router();

// import the controller
const flightsController = require('../controllers/flightsController');

// define routes
router.get('/flights', flightsController.findFlights)

module.exports = router;