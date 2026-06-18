const Order = require("../models/orderModel");


const getOrders = async (req, res) => {
  try {
    const {
      search,
      order_status,
      payment_status,
      payment_method,
      user_id,
      minAmount,
      maxAmount,
      total_amount,
      startDate,
      endDate,
      date,
      createdAt,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { order_id: searchRegex },
        { "shipping_address.recipient_name": searchRegex },
        { "shipping_address.recipient_phone": searchRegex },
        { "items.name": searchRegex },
      ];
    }

    if (order_status) {
      query.order_status = order_status;
    }
    if (payment_status) {
      query.payment_status = payment_status;
    }
    if (payment_method) {
      query.payment_method = payment_method;
    }
    if (user_id) {
      query.user_id = user_id;
    }

    // Amount filtering
    if (total_amount) {
      query.total_amount = parseFloat(total_amount);
    } else if (minAmount || maxAmount) {
      query.total_amount = {};
      if (minAmount) {
        query.total_amount.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        query.total_amount.$lte = parseFloat(maxAmount);
      }
    }

    // Date filtering
    const targetDate = date || createdAt;
    if (targetDate) {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      if (!isNaN(startOfDay.getTime()) && !isNaN(endOfDay.getTime())) {
        query.createdAt = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }
    } else if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          if (endDate.length === 10) {
            end.setHours(23, 59, 59, 999);
          }
          query.createdAt.$lte = end;
        }
      }
    }


    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;


    const sortOrder = order === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };


    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort(sort)
        .skip(skipNum)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while retrieving orders.",
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const { id } = req.params;
    let order;

    // Check if the id is a valid mongoose ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }

    // Fallback/direct search by custom order_id string
    if (!order) {
      order = await Order.findOne({ order_id: id });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID/order_id '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while retrieving order.",
      error: error.message,
    });
  }
};

const getOrdersStats = async (req, res) => {
  try {
    // 1. Overall stats
    const overallStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total_amount" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$total_amount" },
        },
      },
    ]);

    // 2. Breakdown by order status
    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: "$order_status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" },
        },
      },
    ]);

    // 3. Breakdown by payment status
    const paymentStatusStats = await Order.aggregate([
      {
        $group: {
          _id: "$payment_status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" },
        },
      },
    ]);

    // 4. Breakdown by payment method
    const paymentMethodStats = await Order.aggregate([
      {
        $group: {
          _id: "$payment_method",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        summary: overallStats[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
        byOrderStatus: statusStats,
        byPaymentStatus: paymentStatusStats,
        byPaymentMethod: paymentMethodStats,
      },
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while calculating order stats.",
      error: error.message,
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  getOrdersStats,
};


