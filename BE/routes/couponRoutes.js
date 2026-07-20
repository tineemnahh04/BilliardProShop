import express from 'express';
import { couponController } from '../controllers/couponController.js';
import { protect, adminCheck } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public checkout route
router.post('/validate', protect, couponController.validateCoupon);

// Admin-only CRUD routes
router.get('/', protect, adminCheck, couponController.getAll);
router.post('/', protect, adminCheck, couponController.create);
router.put('/:id', protect, adminCheck, couponController.update);
router.delete('/:id', protect, adminCheck, couponController.delete);

export default router;
