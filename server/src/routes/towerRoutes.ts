import express from 'express';
import { getTowers, createTower, getTowerById, updateTower, deleteTower } from '../controllers/towerController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getTowers);
router.post('/', authorize('ADMIN', 'OPERATOR'), createTower);
router.get('/:id', getTowerById);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updateTower);
router.delete('/:id', authorize('ADMIN'), deleteTower);

export default router;
