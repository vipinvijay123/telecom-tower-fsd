import express from 'express';
import { getAssets, createAsset, getAssetById, updateAsset, deleteAsset } from '../controllers/assetController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();
router.use(protect);
router.get('/', getAssets);
router.post('/', authorize('ADMIN', 'OPERATOR'), createAsset);
router.get('/:id', getAssetById);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updateAsset);
router.delete('/:id', authorize('ADMIN'), deleteAsset);
export default router;
