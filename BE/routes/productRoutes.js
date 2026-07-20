import express from 'express';
import { productController } from '../controllers/productController.js';
import { protect, adminCheck } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', productController.getAll);
router.post('/ai-recommend', productController.aiRecommend);
router.get('/:id', productController.getById);

// Admin-only routes
router.post('/', protect, adminCheck, productController.create);
router.put('/:id', protect, adminCheck, productController.update);
router.delete('/:id', protect, adminCheck, productController.delete);
router.patch('/:id/stock', protect, adminCheck, productController.updateStock);

export default router;
