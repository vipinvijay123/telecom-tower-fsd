import express from 'express';
import { getInspections, createInspection, getInspectionById, updateInspection, deleteInspection } from '../controllers/inspectionController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();
router.use(protect);
router.get('/', getInspections);
router.post('/', authorize('ADMIN', 'OPERATOR', 'TECHNICIAN'), createInspection);
router.get('/:id', getInspectionById);
router.put('/:id', authorize('ADMIN', 'OPERATOR', 'TECHNICIAN'), updateInspection);
router.delete('/:id', authorize('ADMIN'), deleteInspection);
export default router;
