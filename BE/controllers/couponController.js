import { Coupon } from '../models/couponModel.js';

export const couponController = {
  // Lấy danh sách toàn bộ mã giảm giá (dành cho Admin quản lý)
  getAll: async (req, res) => {
    try {
      const coupons = await Coupon.find({}).sort({ createdAt: -1 });
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
  },

  // Tạo mã giảm giá mới
  create: async (req, res) => {
    try {
      const { code, discount, type, minSpend, isActive, expiryDate } = req.body;
      if (!code || discount === undefined) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (mã, mức giảm giá)' });
      }

      const existing = await Coupon.findOne({ code: code.toUpperCase() });
      if (existing) {
        return res.status(400).json({ message: 'Mã giảm giá này đã tồn tại' });
      }

      const coupon = new Coupon({
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        type: type || 'percentage',
        minSpend: minSpend !== undefined ? parseFloat(minSpend) : 0,
        isActive: isActive !== undefined ? isActive : true,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      });

      await coupon.save();
      res.status(201).json(coupon);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo mã giảm giá', error: error.message });
    }
  },

  // Cập nhật mã giảm giá
  update: async (req, res) => {
    try {
      const { code, discount, type, minSpend, isActive, expiryDate } = req.body;
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
      }

      if (code) {
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing && existing._id.toString() !== req.params.id) {
          return res.status(400).json({ message: 'Mã giảm giá này đã tồn tại ở bản ghi khác' });
        }
        coupon.code = code.toUpperCase();
      }

      if (discount !== undefined) coupon.discount = parseFloat(discount);
      if (type !== undefined) coupon.type = type;
      if (minSpend !== undefined) coupon.minSpend = parseFloat(minSpend);
      if (isActive !== undefined) coupon.isActive = isActive;
      
      // Update expiryDate correctly
      if (expiryDate !== undefined) {
        coupon.expiryDate = expiryDate ? new Date(expiryDate) : null;
      }

      await coupon.save();
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật mã giảm giá', error: error.message });
    }
  },

  // Xóa mã giảm giá
  delete: async (req, res) => {
    try {
      const coupon = await Coupon.findByIdAndDelete(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
      }
      res.json({ message: 'Đã xóa mã giảm giá thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa mã giảm giá', error: error.message });
    }
  }
};
