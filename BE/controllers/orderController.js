import { OrderModel } from '../models/orderModel.js';

export const orderController = {
  getAll: (req, res) => {
    try {
      const { customerName, customerEmail } = req.query;
      let orders;
      if (customerEmail) {
        orders = OrderModel.getByCustomerEmail(customerEmail);
      } else if (customerName) {
        orders = OrderModel.getByCustomerName(customerName);
      } else {
        orders = OrderModel.getAll();
      }
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng', error: error.message });
    }
  },

  create: (req, res) => {
    try {
      if (!req.body.items || req.body.items.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng không được để trống' });
      }
      const newOrder = OrderModel.create(req.body);
      res.status(201).json(newOrder);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo đơn hàng mới', error: error.message });
    }
  },

  updateStatus: (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Trạng thái là bắt buộc' });
      }
      const updatedOrder = OrderModel.updateStatus(req.params.id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng để cập nhật' });
      }
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng', error: error.message });
    }
  }
};
