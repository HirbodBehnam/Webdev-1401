const getHistory = async (req, res) => {
    console.log(req.user);
    res.json({ message: "History" });
}

module.exports = getHistory;