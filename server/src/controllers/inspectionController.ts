import { Request, Response } from 'express';
import { Inspection } from '../models/Inspection';

export const getInspections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { towerId, technicianId, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (towerId) filter.towerId = towerId;
    if (technicianId) filter.technicianId = technicianId;
    if (status) filter.status = status;
    const inspections = await Inspection.find(filter)
      .populate('towerId', 'name towerId')
      .populate('technicianId', 'name technicianId')
      .sort({ inspectionDate: -1 });
    res.json({ success: true, count: inspections.length, data: inspections });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch inspections.' }); }
};

export const createInspection = async (req: Request, res: Response): Promise<void> => {
  try {
    const inspection = await Inspection.create(req.body);
    res.status(201).json({ success: true, data: inspection });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to create inspection.' });
  }
};

export const getInspectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('towerId', 'name towerId')
      .populate('technicianId', 'name technicianId');
    if (!inspection) { res.status(404).json({ success: false, message: 'Inspection not found.' }); return; }
    res.json({ success: true, data: inspection });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch inspection.' }); }
};

export const updateInspection = async (req: Request, res: Response): Promise<void> => {
  try {
    const inspection = await Inspection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!inspection) { res.status(404).json({ success: false, message: 'Inspection not found.' }); return; }
    res.json({ success: true, data: inspection });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to update inspection.' });
  }
};

export const deleteInspection = async (req: Request, res: Response): Promise<void> => {
  try {
    const inspection = await Inspection.findByIdAndDelete(req.params.id);
    if (!inspection) { res.status(404).json({ success: false, message: 'Inspection not found.' }); return; }
    res.json({ success: true, message: 'Inspection deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to delete inspection.' }); }
};
