import express from 'express';
import { register, login, getMe, getAllUsers } from '../controllers/authController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('ADMIN'), getAllUsers);

export default router;
