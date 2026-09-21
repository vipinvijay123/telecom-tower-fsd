import { Request, Response } from 'express';
import { Technician } from '../models/Technician';

export const getTechnicians = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    const technicians = await Technician.find(filter)
      .populate('assignedTowers', 'name towerId status')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: technicians.length, data: technicians });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch technicians.' }); }
};

export const createTechnician = async (req: Request, res: Response): Promise<void> => {
  try {
    const technician = await Technician.create(req.body);
    res.status(201).json({ success: true, data: technician });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to create technician.' });
  }
};

export const getTechnicianById = async (req: Request, res: Response): Promise<void> => {
  try {
    const technician = await Technician.findById(req.params.id).populate('assignedTowers', 'name towerId status');
    if (!technician) { res.status(404).json({ success: false, message: 'Technician not found.' }); return; }
    res.json({ success: true, data: technician });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch technician.' }); }
};

export const updateTechnician = async (req: Request, res: Response): Promise<void> => {
  try {
    const technician = await Technician.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!technician) { res.status(404).json({ success: false, message: 'Technician not found.' }); return; }
    res.json({ success: true, data: technician });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to update technician.' });
  }
};

export const deleteTechnician = async (req: Request, res: Response): Promise<void> => {
  try {
    const technician = await Technician.findByIdAndDelete(req.params.id);
    if (!technician) { res.status(404).json({ success: false, message: 'Technician not found.' }); return; }
    res.json({ success: true, message: 'Technician deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to delete technician.' }); }
};
