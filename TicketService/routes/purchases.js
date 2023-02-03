const express = require('express');

const router = express.Router();

const validateToken = require('../middleware/userAuth');

const getPurchases = require('../controllers/purchasesController');

router.get('/purchases', validateToken, getPurchases);
module.exports = router;
