import { Request, Response } from 'express';
import { Battery } from '../models/Battery';

export const getBatteries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { towerId, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (towerId) filter.towerId = towerId;
    if (status) filter.status = status;
    const batteries = await Battery.find(filter).populate('towerId', 'name towerId').sort({ createdAt: -1 });
    res.json({ success: true, count: batteries.length, data: batteries });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch batteries.' }); }
};

export const createBattery = async (req: Request, res: Response): Promise<void> => {
  try {
    const battery = await Battery.create(req.body);
    res.status(201).json({ success: true, data: battery });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to create battery.' });
  }
};

export const getBatteryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const battery = await Battery.findById(req.params.id).populate('towerId', 'name towerId');
    if (!battery) { res.status(404).json({ success: false, message: 'Battery not found.' }); return; }
    res.json({ success: true, data: battery });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch battery.' }); }
};

export const updateBattery = async (req: Request, res: Response): Promise<void> => {
  try {
    const battery = await Battery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!battery) { res.status(404).json({ success: false, message: 'Battery not found.' }); return; }
    res.json({ success: true, data: battery });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to update battery.' });
  }
};

export const deleteBattery = async (req: Request, res: Response): Promise<void> => {
  try {
    const battery = await Battery.findByIdAndDelete(req.params.id);
    if (!battery) { res.status(404).json({ success: false, message: 'Battery not found.' }); return; }
    res.json({ success: true, message: 'Battery deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to delete battery.' }); }
};
