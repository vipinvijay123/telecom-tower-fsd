import express from 'express';
import { getTechnicians, createTechnician, getTechnicianById, updateTechnician, deleteTechnician } from '../controllers/technicianController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();
router.use(protect);
router.get('/', getTechnicians);
router.post('/', authorize('ADMIN'), createTechnician);
router.get('/:id', getTechnicianById);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updateTechnician);
router.delete('/:id', authorize('ADMIN'), deleteTechnician);
export default router;
