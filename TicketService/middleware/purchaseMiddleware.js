const { check, param } = require("express-validator");
const uuid = require("uuid");

const purchaseTicketMiddleware = [
  check("flightId").isString().withMessage("flightId should be a string"),
  check("flightClass").isIn(["y", "j", "f"]).withMessage("wrong flight class!"),
];

const transactionRedirectMiddleware = [
  param("transactionUuid")
    .exists()
    .custom((value) => {
      if (!uuid.validate(value)) throw new Error("invalid uuid!");
      return true;
    }),
  param("result").exists().toInt(),
];

module.exports = { purchaseTicketMiddleware, transactionRedirectMiddleware };
