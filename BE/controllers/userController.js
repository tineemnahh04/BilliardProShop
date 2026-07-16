import { UserModel } from '../models/userModel.js';

export const userController = {
  login: (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ email và mật khẩu' });
      }

      const user = UserModel.findByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        message: 'Đăng nhập thành công',
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập', error: error.message });
    }
  },

  register: (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' });
      }

      const existingUser = UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email này đã được đăng ký tài khoản' });
      }

      const newUser = UserModel.create({
        email,
        password,
        name,
        role: 'customer'
      });

      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({
        message: 'Đăng ký tài khoản thành công',
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký', error: error.message });
    }
  }
};
