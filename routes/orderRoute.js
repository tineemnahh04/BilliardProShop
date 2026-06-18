const express = require("express");
const router = express.Router();
const { getOrders, getOrderById } = require("../controllers/orderController");

router.get("/", getOrders);
router.get("/:id", getOrderById);

module.exports = router;



