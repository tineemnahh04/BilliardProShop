import express from 'express';
import { customerController } from '../controllers/customerController.js';
import { protect, adminCheck } from '../middleware/authMiddleware.js';

const router = express.Router();

// Chỉ Admin mới được phép xem danh sách khách hàng
router.get('/', protect, adminCheck, customerController.getAll);

export default router;
