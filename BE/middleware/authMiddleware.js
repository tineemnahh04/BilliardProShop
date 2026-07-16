import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'billiard_secret_key_2026_xyz123');
      
      req.user = await User.findOne({ id: decoded.id }).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Tài khoản không tồn tại trong hệ thống' });
      }
      
      if (req.user.status === 'Đang khóa') {
        return res.status(403).json({ message: 'Tài khoản này đã bị khóa' });
      }

      next();
    } catch (error) {
      console.error('Lỗi xác thực JWT:', error);
      res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  } else {
    res.status(401).json({ message: 'Không tìm thấy Token xác thực' });
  }
};

export const adminCheck = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Quyền truy cập bị từ chối, yêu cầu tài khoản Admin' });
  }
};
