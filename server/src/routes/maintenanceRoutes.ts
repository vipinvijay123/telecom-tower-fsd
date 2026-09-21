import express from 'express';
import { getMaintenances, createMaintenance, getMaintenanceById, updateMaintenance, deleteMaintenance } from '../controllers/maintenanceController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();
router.use(protect);
router.get('/', getMaintenances);
router.post('/', authorize('ADMIN', 'OPERATOR'), createMaintenance);
router.get('/:id', getMaintenanceById);
router.put('/:id', authorize('ADMIN', 'OPERATOR', 'TECHNICIAN'), updateMaintenance);
router.delete('/:id', authorize('ADMIN'), deleteMaintenance);
export default router;
