import express from 'express';
import {
  registerUser,
  loginUser,
  registerAgent,
  loginAgent,
  toggleFavorite,
  getFavorites
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.post('/agent/register', registerAgent);
router.post('/agent/login', loginAgent);
router.put('/favorites', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

export default router;
