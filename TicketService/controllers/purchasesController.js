const db = require("../db");

const getPurchases = async (req, res) => {
  console.log("hey");
  // console.log(req.user);
  const result = await db.any(
    "SELECT * FROM purchase WHERE corresponding_user_id = $1",
    [req.user.id]
  );
  res.json({ message: result });
};

const purchaseTicket = async (req, res) => {
  // todo make sure the user is authenticated
  // get user ID, flight ID and flight class
  // get the `available_offers` view
  // check if 1) the flight class has capacity and 2) it's not past the departure time UTC
  // get the flight price based on type
  // do the transaction
  // if the transaction was successful, create a new `purchase` object
  // show the response to user
}

module.exports = getPurchases;
