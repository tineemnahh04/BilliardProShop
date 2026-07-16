import express from 'express';
import { couponController } from '../controllers/couponController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', couponController.getAll);
router.post('/validate', protect, couponController.validateCoupon);

export default router;
