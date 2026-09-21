import { Request, Response } from 'express';
import { Maintenance } from '../models/Maintenance';

export const getMaintenances = async (req: Request, res: Response): Promise<void> => {
  try {
    const { towerId, technicianId, status, priority } = req.query;
    const filter: Record<string, unknown> = {};
    if (towerId) filter.towerId = towerId;
    if (technicianId) filter.technicianId = technicianId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    const maintenances = await Maintenance.find(filter)
      .populate('towerId', 'name towerId')
      .populate('assetId', 'assetId assetType')
      .populate('technicianId', 'name technicianId')
      .sort({ scheduledDate: 1 });
    res.json({ success: true, count: maintenances.length, data: maintenances });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch maintenance records.' }); }
};

export const createMaintenance = async (req: Request, res: Response): Promise<void> => {
  try {
    const m = await Maintenance.create(req.body);
    res.status(201).json({ success: true, data: m });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to create maintenance.' });
  }
};

export const getMaintenanceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const m = await Maintenance.findById(req.params.id)
      .populate('towerId', 'name towerId')
      .populate('assetId', 'assetId assetType')
      .populate('technicianId', 'name technicianId');
    if (!m) { res.status(404).json({ success: false, message: 'Maintenance not found.' }); return; }
    res.json({ success: true, data: m });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch maintenance.' }); }
};

export const updateMaintenance = async (req: Request, res: Response): Promise<void> => {
  try {
    const m = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!m) { res.status(404).json({ success: false, message: 'Maintenance not found.' }); return; }
    res.json({ success: true, data: m });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to update maintenance.' });
  }
};

export const deleteMaintenance = async (req: Request, res: Response): Promise<void> => {
  try {
    const m = await Maintenance.findByIdAndDelete(req.params.id);
    if (!m) { res.status(404).json({ success: false, message: 'Maintenance not found.' }); return; }
    res.json({ success: true, message: 'Maintenance deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to delete maintenance.' }); }
};
