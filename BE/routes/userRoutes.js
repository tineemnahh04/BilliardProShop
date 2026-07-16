import express from 'express';
import { userController } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/me', protect, userController.getMe);
router.put('/profile', protect, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);
router.post('/wishlist', protect, userController.toggleWishlist);

export default router;
