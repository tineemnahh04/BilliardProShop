import express from 'express';
import { marketplaceController } from '../controllers/marketplaceController.js';

const router = express.Router();

router.get('/', marketplaceController.getAll);
router.get('/:id', marketplaceController.getById);
router.post('/', marketplaceController.create);
router.post('/:id/offer', marketplaceController.makeOffer);
router.patch('/:id/offer/:offerId', marketplaceController.respondOffer);
router.post('/:id/bid', marketplaceController.placeBid);
router.post('/:id/trade', marketplaceController.proposeTrade);
router.post('/:id/review', marketplaceController.addReview);
router.get('/:id/chat', marketplaceController.getChatMessages);
router.post('/:id/chat', marketplaceController.sendChatMessage);
router.patch('/:id/chat/:msgId/recall', marketplaceController.recallChatMessage);
router.delete('/:id/chat', marketplaceController.clearChatMessages);

export default router;
