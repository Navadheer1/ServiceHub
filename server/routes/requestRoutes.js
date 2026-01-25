import express from 'express';
import {
  createRequest,
  getRequestFeed,
  getUserRequests,
  getAgentJobs,
  acceptRequest,
  updateStatus,
} from '../controllers/requestController.js';
import { protect, agentOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/', protect, createRequest);
router.get('/my', protect, getUserRequests);

// Agent routes
router.get('/feed', protect, agentOnly, getRequestFeed);
router.get('/agent/jobs', protect, agentOnly, getAgentJobs);
router.put('/:id/accept', protect, agentOnly, acceptRequest);
router.put('/:id/status', protect, agentOnly, updateStatus);

export default router;
