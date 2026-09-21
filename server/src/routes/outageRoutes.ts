import express from 'express';
import { getOutages, createOutage, getOutageById, updateOutage, deleteOutage } from '../controllers/outageController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();
router.use(protect);
router.get('/', getOutages);
router.post('/', authorize('ADMIN', 'OPERATOR'), createOutage);
router.get('/:id', getOutageById);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updateOutage);
router.delete('/:id', authorize('ADMIN'), deleteOutage);
export default router;
