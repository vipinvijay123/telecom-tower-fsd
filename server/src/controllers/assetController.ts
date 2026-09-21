import { Request, Response } from 'express';
import { Asset } from '../models/Asset';

export const getAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { towerId, status, assetType } = req.query;
    const filter: Record<string, unknown> = {};
    if (towerId) filter.towerId = towerId;
    if (status) filter.status = status;
    if (assetType) filter.assetType = assetType;
    const assets = await Asset.find(filter).populate('towerId', 'name towerId').sort({ createdAt: -1 });
    res.json({ success: true, count: assets.length, data: assets });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch assets.' }); }
};

export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json({ success: true, data: asset });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to create asset.' });
  }
};

export const getAssetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const asset = await Asset.findById(req.params.id).populate('towerId', 'name towerId');
    if (!asset) { res.status(404).json({ success: false, message: 'Asset not found.' }); return; }
    res.json({ success: true, data: asset });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch asset.' }); }
};

export const updateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!asset) { res.status(404).json({ success: false, message: 'Asset not found.' }); return; }
    res.json({ success: true, data: asset });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to update asset.' });
  }
};

export const deleteAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) { res.status(404).json({ success: false, message: 'Asset not found.' }); return; }
    res.json({ success: true, message: 'Asset deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to delete asset.' }); }
};
