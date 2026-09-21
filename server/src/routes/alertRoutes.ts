import express from 'express';
import { getAlerts, createAlert, getAlertById, updateAlert, deleteAlert } from '../controllers/alertController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();
router.use(protect);
router.get('/', getAlerts);
router.post('/', authorize('ADMIN', 'OPERATOR'), createAlert);
router.get('/:id', getAlertById);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updateAlert);
router.delete('/:id', authorize('ADMIN'), deleteAlert);
export default router;
