import express from 'express';
import { orderController } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', orderController.getAll);
router.post('/', orderController.create);
router.put('/:id', orderController.updateStatus);

export default router;
