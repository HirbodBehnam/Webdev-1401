const axios = require("axios");
const uuid = require("uuid");
const { validationResult } = require("express-validator");
const db = require("../db");

const getPurchases = async (req, res) => {
  const result = await db.any(
    "SELECT * FROM purchase WHERE corresponding_user_id = $1",
    [req.user.id]
  );
  return res.json({ message: result });
};

const purchaseTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const { flightId, flightClass } = req.body;
  const availableOffers = await db.any(
    "SELECT * FROM available_offers WHERE flight_id = $1",
    flightId.toString()
  );
  // console.log(JSON.stringify(availableOffers));
  if (availableOffers.length === 0) {
    return res.status(404).send("this flight does not exist!");
  }
  if (availableOffers.length >= 2) {
    return res.sendStatus(502);
  }
  const offer = availableOffers[0];
  let freeCapacity = 0;
  let flightPrice = Infinity;
  switch (flightClass) {
    case "y":
      freeCapacity = offer.y_class_free_capacity;
      flightPrice = offer.y_price;
      break;
    case "j":
      freeCapacity = offer.j_class_free_capacity;
      flightPrice = offer.j_price;
      break;
    case "f":
      freeCapacity = offer.f_class_free_capacity;
      flightPrice = offer.f_price;
      break;
    default:
      return res.sendStatus(400);
  }
  if (freeCapacity <= 0) {
    return res.status(400).send("flight not available!");
  }
  const now = new Date();
  if (now > offer.departure_local_time) {
    return res.status(400).send("too late bitch!");
  }
  // todo should we reserve the seat for the passenger?
  const transactionUuid = uuid.v4();
  const bankResponse = await axios.post(
    `http://${process.env.BANK_URL}/transaction/`,
    {
      amount: flightPrice,
      receipt_id: process.env.BANK_RECEIPT_ID,
      callback: `http://${process.env.HOST}:${process.env.PORT}/purchase/callback/${transactionUuid}`,
    }
  );
  const transactionId = bankResponse.data.id;
  await db.none(
    "INSERT INTO transaction_draft (corresponding_user_id, flight_serial, offer_price, offer_class, transaction_id, uuid) VALUES ($1, $2, $3, $4, $5, $6)",
    [
      req.user.id,
      flightId,
      flightPrice,
      flightClass,
      transactionId,
      transactionUuid,
    ]
  );
  return res.redirect(
    `http://${process.env.BANK_URL}/payment/${transactionId}/`
  );
};

const transactionRedirect = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const { transactionUuid, result } = req.params;
  let transactionDraft;
  try {
    transactionDraft = await db.one(
      "SELECT * FROM transaction_draft WHERE uuid = $1",
      transactionUuid
    );
  } catch (error) {
    return res.status(400).send("wrong uuid!");
  }
  if (result > 1) {
    await db.none(
      "DELETE FROM transaction_draft WHERE uuid = $1",
      transactionUuid
    );
    return res.status(400).send("payment was not successful!");
  }
  let correspondingUser;
  try {
    correspondingUser = await db.one(
      "SELECT * FROM user_account WHERE user_id = $1",
      transactionDraft.corresponding_user_id
    );
  } catch (error) {
    return res.status(400).send("wrong user!");
  }
  let userTitle;
  if (correspondingUser.gender === "m") userTitle = "Mr.";
  else if (correspondingUser.gender === "f") userTitle = "Ms.";
  else return res.sendStatus(500);
  let flight;
  try {
    flight = db.one(
      "SELECT * FROM flight WHERE flight_id = $1",
      transactionDraft.flight_serial
    );
  } catch (error) {
    return res.status(400).send("no flights available!");
  }
  // console.log(JSON.stringify(flight));
  await db.none(
    "INSERT INTO purchase (corresponding_user_id, title, first_name, last_name, flight_serial, offer_price, offer_class, transaction_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [
      correspondingUser.user_id,
      userTitle,
      correspondingUser.first_name,
      correspondingUser.last_name,
      flight.flight_serial,
      transactionDraft.offer_price,
      transactionDraft.offer_class,
      transactionDraft.transaction_id,
    ]
  );
  await db.none(
    "DELETE FROM transaction_draft WHERE uuid = $1",
    transactionUuid
  );
  return res.sendStatus(200);
};

module.exports = { getPurchases, purchaseTicket, transactionRedirect };
