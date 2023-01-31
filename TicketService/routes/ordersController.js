const express = require('express');
const router = express.Router();

const authorizeToken = require('../middleware/userAuth');

const { getHistory } = require('../controllers/ordersController');

router.get('/history', authorizeToken, getHistory);