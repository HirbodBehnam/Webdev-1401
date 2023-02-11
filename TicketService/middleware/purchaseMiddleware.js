const { check, param } = require("express-validator");
const uuid = require("uuid");

const purchaseTicketMiddleware = [
  check("flightSerial").isInt().withMessage("flightSerial should be an integer!"),
  check("flightClass").isIn(["y", "j", "f"]).withMessage("wrong flight class!"),
];

const transactionRedirectMiddleware = [
  param("transactionUuid")
    .isString()
    .custom((value) => {
      if (!uuid.validate(value)) throw new Error("invalid uuid!");
      return true;
    }),
  param("result").exists().toInt(),
];

module.exports = { purchaseTicketMiddleware, transactionRedirectMiddleware };
