const axios = require("axios");
const uuid = require("uuid");
const { validationResult } = require("express-validator");
const db = require("../db");

const getPurchases = async (req, res) => {
  // console.log('hey');
  // console.log(req.user);
  const result = await db.any(
    "SELECT * FROM purchase WHERE corresponding_user_id = $1",
    [req.user.id]
  );
  return res.json({ message: result });
};

const purchaseTicket = async (req, res) => {
  // get user ID, flight ID and flight class
  // get the `available_offers` view
  // check if 1) the flight class has capacity and 2) it's not past the departure time UTC
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const { flightId, flightType } = req.body;
  const availableOffers = await db.any(
    "SELECT * FROM available_offers WHERE flight_id = $1",
    flightId
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
  switch (flightType) {
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
  const bankResponse = await axios.post(`${process.env.BANK_URL}/transaction`, {
    amount: flightPrice,
    receipt_id: process.env.BANK_RECEIPT_ID,
    callback: `${process.env.HOST}:${process.env.PORT}/purchase/callback/${transactionUuid}`,
  });
  const { id: transactionId } = await bankResponse.json();
  // todo create transaction draft table
  await db.none(
    "INSERT INTO transaction_draft (corresponding_user_id, flight_serial, offer_price, offer_class, transaction_id, uuid) VALUES ($1, $2, $3, $4, $5, $6)",
    [
      req.user.id,
      flightId,
      flightPrice,
      flightType,
      transactionId,
      transactionUuid,
    ]
  );
  return res.redirect(`${process.env.BANK_URL}/payment/${transactionId}/`);
  // get the flight price based on type
  // do the transaction
  // if the transaction was successful, create a new `purchase` object
  // show the response to user
};

const transactionRedirect = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const { transactionUuid, result } = req.params;
  const transactionDraft = await db.one(
    "SELECT * FROM transaction_draft WHERE uuid = $1",
    transactionUuid
  );
  if (!transactionDraft) {
    return res.status(400).send("wrong uuid!");
  }
  if (result > 1) {
    await db.none(
      "DELETE FROM transaction_draft WHERE uuid = $1",
      transactionDraft
    );
    return res.status(400).send("payment was not successful!");
  }
  // todo this needs to connect to auth db
  const correspondingUser = await authDb.one(
    "SELECT * FROM user_account WHERE user_id = $1",
    transactionDraft.corresponding_user_id
  );
  if (!correspondingUser) {
    return res.status(400).send("wrong user!");
  }
  let userTitle;
  if (correspondingUser.gender === "M") userTitle = "Mr.";
  else if (correspondingUser.gender === "F") userTitle = "Ms.";
  else {
    return res.sendStatus(500);
  }
  await db.none(
    "INSERT INTO purchase (corresponding_user_id, title, first_name, last_name, flight_serial, offer_price, offer_class, transaction_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [
      correspondingUser.user_id,
      userTitle,
      correspondingUser.first_name,
      correspondingUser.last_name,
      transactionDraft.flight_serial,
      transactionDraft.offer_price,
      transactionDraft.offer_class,
      transactionDraft.transaction_id,
    ]
  );
  await db.none(
    "DELETE FROM transaction_draft WHERE uuid = $1",
    transactionDraft
  );
  return res.sendStatus(200);
};

module.exports = { getPurchases, purchaseTicket, transactionRedirect };
