import express from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { protect, adminCheck } from '../middleware/authMiddleware.js';

const router = express.Router();

// Chỉ Admin mới được truy cập các chỉ số phân tích kinh doanh
router.get('/', protect, adminCheck, analyticsController.getStats);

export default router;
