const express = require("express");

const router = express.Router();

const validateToken = require("../middleware/userAuth");
const {
  purchaseTicketMiddleware,
  transactionRedirectMiddleware,
} = require("../middleware/purchaseMiddleware");

const {
  getPurchases,
  purchaseTicket,
  transactionRedirect,
} = require("../controllers/purchasesController");

router.get("/purchases", validateToken, getPurchases);
router.post(
  "/purchase",
  validateToken,
  ...purchaseTicketMiddleware,
  purchaseTicket
);
router.get(
  "/purchase/callback/:transactionUuid/:result",
  transactionRedirectMiddleware,
  transactionRedirect
);

module.exports = router;
