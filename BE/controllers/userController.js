import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

// Hàm helper sinh JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'billiard_secret_key_2026_xyz123', {
    expiresIn: '30d',
  });
};

export const userController = {
  // Đăng nhập
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ email và mật khẩu' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
      }

      if (user.status === 'Đang khóa') {
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
      }

      const token = generateToken(user.id);
      const userObj = user.toObject();
      delete userObj.password;

      res.json({
        message: 'Đăng nhập thành công',
        token,
        user: userObj
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập', error: error.message });
    }
  },

  // Đăng ký
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email này đã được đăng ký tài khoản' });
      }

      // Lấy ID tự tăng
      const lastUser = await User.findOne().sort({ id: -1 });
      const nextId = lastUser ? lastUser.id + 1 : 1;

      const user = await User.create({
        id: nextId,
        email,
        password,
        name,
        role: 'customer'
      });

      const token = generateToken(user.id);
      const userObj = user.toObject();
      delete userObj.password;

      res.status(201).json({
        message: 'Đăng ký tài khoản thành công',
        token,
        user: userObj
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký', error: error.message });
    }
  },

  // Lấy thông tin cá nhân
  getMe: async (req, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy thông tin cá nhân', error: error.message });
    }
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async (req, res) => {
    try {
      const { name, email, avatar, address, phone } = req.body;
      const user = await User.findOne({ id: req.user.id });

      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
      }

      // Check email trùng nếu muốn đổi email
      if (email && email.toLowerCase() !== user.email.toLowerCase()) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email này đã có người sử dụng' });
        }
        user.email = email;
      }

      user.name = name || user.name;
      user.avatar = avatar !== undefined ? avatar : user.avatar;
      user.address = address !== undefined ? address : user.address;
      user.phone = phone !== undefined ? phone : user.phone;

      const updatedUser = await user.save();
      const userObj = updatedUser.toObject();
      delete userObj.password;

      res.json({
        message: 'Cập nhật thông tin thành công',
        user: userObj
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật hồ sơ', error: error.message });
    }
  },

  // Đổi mật khẩu
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới' });
      }

      const user = await User.findOne({ id: req.user.id });
      const isMatch = await user.comparePassword(currentPassword);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi đổi mật khẩu', error: error.message });
    }
  },

  // Thêm/Xóa sản phẩm yêu thích (Wishlist)
  toggleWishlist: async (req, res) => {
    try {
      const productId = parseInt(req.body.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
      }

      const user = await User.findOne({ id: req.user.id });
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      const index = user.wishlist.indexOf(productId);
      if (index > -1) {
        // Có sẵn -> Xóa khỏi wishlist
        user.wishlist.splice(index, 1);
      } else {
        // Chưa có -> Thêm vào wishlist
        user.wishlist.push(productId);
      }

      await user.save();
      res.json({
        message: index > -1 ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích',
        wishlist: user.wishlist
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật danh sách yêu thích', error: error.message });
    }
  }
};
