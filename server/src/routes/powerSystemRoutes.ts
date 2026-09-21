import express from 'express';
import { getPowerSystems, createPowerSystem, getPowerSystemById, updatePowerSystem, deletePowerSystem } from '../controllers/powerSystemController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();
router.use(protect);
router.get('/', getPowerSystems);
router.post('/', authorize('ADMIN', 'OPERATOR'), createPowerSystem);
router.get('/:id', getPowerSystemById);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updatePowerSystem);
router.delete('/:id', authorize('ADMIN'), deletePowerSystem);
export default router;
