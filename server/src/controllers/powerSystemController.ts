import { Request, Response } from 'express';
import { PowerSystem } from '../models/PowerSystem';

export const getPowerSystems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { towerId, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (towerId) filter.towerId = towerId;
    if (status) filter.status = status;
    const systems = await PowerSystem.find(filter).populate('towerId', 'name towerId').sort({ createdAt: -1 });
    res.json({ success: true, count: systems.length, data: systems });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch power systems.' }); }
};

export const createPowerSystem = async (req: Request, res: Response): Promise<void> => {
  try {
    const ps = await PowerSystem.create(req.body);
    res.status(201).json({ success: true, data: ps });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to create power system.' });
  }
};

export const getPowerSystemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const ps = await PowerSystem.findById(req.params.id).populate('towerId', 'name towerId');
    if (!ps) { res.status(404).json({ success: false, message: 'Power system not found.' }); return; }
    res.json({ success: true, data: ps });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch power system.' }); }
};

export const updatePowerSystem = async (req: Request, res: Response): Promise<void> => {
  try {
    const ps = await PowerSystem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ps) { res.status(404).json({ success: false, message: 'Power system not found.' }); return; }
    res.json({ success: true, data: ps });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to update power system.' });
  }
};

export const deletePowerSystem = async (req: Request, res: Response): Promise<void> => {
  try {
    const ps = await PowerSystem.findByIdAndDelete(req.params.id);
    if (!ps) { res.status(404).json({ success: false, message: 'Power system not found.' }); return; }
    res.json({ success: true, message: 'Power system deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to delete power system.' }); }
};
