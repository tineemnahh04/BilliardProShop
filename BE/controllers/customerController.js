import { CustomerModel } from '../models/customerModel.js';

export const customerController = {
  getAll: (req, res) => {
    try {
      const customers = CustomerModel.getAll();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách khách hàng', error: error.message });
    }
  },

  create: (req, res) => {
    try {
      if (!req.body.name) {
        return res.status(400).json({ message: 'Tên khách hàng là bắt buộc' });
      }
      const newCustomer = CustomerModel.create(req.body);
      res.status(201).json(newCustomer);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lưu thông tin khách hàng', error: error.message });
    }
  }
};
