import express from 'express';
import { getChatRoom, getMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/room/:bookingId', protect, getChatRoom);
router.get('/messages/:chatRoomId', protect, getMessages);
router.post('/message', protect, sendMessage);

export default router;
