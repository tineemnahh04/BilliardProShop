import { Coupon } from '../models/couponModel.js';

export const couponController = {
  // Lấy danh sách toàn bộ mã giảm giá còn hiệu lực
  getAll: async (req, res) => {
    try {
      const coupons = await Coupon.find({ isActive: true });
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách mã giảm giá', error: error.message });
    }
  },

  // Kiểm tra tính hợp lệ của mã giảm giá khi Checkout
  validateCoupon: async (req, res) => {
    try {
      const { code, subtotal } = req.body;
      if (!code) {
        return res.status(400).json({ message: 'Vui lòng cung cấp mã giảm giá' });
      }

      const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
      if (!coupon) {
        return res.status(404).json({ isValid: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
      }

      // Kiểm tra hạn sử dụng nếu có
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({ isValid: false, message: 'Mã giảm giá đã hết hạn sử dụng' });
      }

      // Kiểm tra mức chi tiêu tối thiểu
      if (subtotal && parseFloat(subtotal) < coupon.minSpend) {
        return res.status(400).json({ 
          isValid: false, 
          message: `Mã này chỉ áp dụng cho đơn hàng tối thiểu từ $${coupon.minSpend}` 
        });
      }

      res.json({
        isValid: true,
        message: 'Áp dụng mã giảm giá thành công!',
        discount: coupon.discount,
        type: coupon.type,
        code: coupon.code
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi máy chủ khi kiểm tra mã giảm giá', error: error.message });
    }
  }
};
