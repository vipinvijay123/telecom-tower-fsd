import express from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/dashboardController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/recent', getRecentActivity);
export default router;
