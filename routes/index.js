const express = require("express");
const router = express.Router();
const orderRoute = require("./orderRoute");

router.use("/orders", orderRoute);

module.exports = router;

