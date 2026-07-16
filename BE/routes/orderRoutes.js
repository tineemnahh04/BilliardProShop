import express from 'express';
import { orderController } from '../controllers/orderController.js';
import { protect, adminCheck } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, orderController.getAll);
router.post('/', protect, orderController.create);
router.put('/:id', protect, adminCheck, orderController.updateStatus);

export default router;
