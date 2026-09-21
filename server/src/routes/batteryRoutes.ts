import express from 'express';
import { getBatteries, createBattery, getBatteryById, updateBattery, deleteBattery } from '../controllers/batteryController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();
router.use(protect);
router.get('/', getBatteries);
router.post('/', authorize('ADMIN', 'OPERATOR'), createBattery);
router.get('/:id', getBatteryById);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updateBattery);
router.delete('/:id', authorize('ADMIN'), deleteBattery);
export default router;
