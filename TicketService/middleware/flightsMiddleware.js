const { query } = require("express-validator");

const midllewares = [
  query("origin").notEmpty(),
  query("destination").notEmpty(),
  query("departureDate")
    .notEmpty()
    .withMessage("is empty")
    .isDate()
    .withMessage("is not date")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("is not in format YYYY-MM-DD"),

  query("returnDate")
    .custom((value, { req }) => {
      // set request hasReturn Field to true if it exists
      req.hasReturn = !!value;
      return true;
    })
    .if((value, { req }) => req.hasReturn)
    .isDate()
    .withMessage("is not date")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("is not in format YYYY-MM-DD")
    .custom((value, { req }) => {
      if (Date.parse(value) < Date.parse(req.query.departureDate)) {
        throw new Error("return date before departureDate");
      }
      console.log("return date after departureDate");
      return true;
    }),
];

module.exports = midllewares;
