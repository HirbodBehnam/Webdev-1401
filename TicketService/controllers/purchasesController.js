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

module.exports = getPurchases;
