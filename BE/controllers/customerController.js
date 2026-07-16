import { User } from '../models/userModel.js';

export const customerController = {
  // Lấy toàn bộ danh sách khách hàng (chỉ dành cho Admin)
  getAll: async (req, res) => {
    try {
      // Tìm tất cả người dùng có vai trò là customer
      const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách khách hàng', error: error.message });
    }
  }
};
