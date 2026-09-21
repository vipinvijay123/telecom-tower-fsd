import { Request, Response } from 'express';
import { Outage } from '../models/Outage';
import { AuthRequest } from '../middleware/auth';

export const getOutages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { towerId, status, severity } = req.query;
    const filter: Record<string, unknown> = {};
    if (towerId) filter.towerId = towerId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    const outages = await Outage.find(filter)
      .populate('towerId', 'name towerId')
      .populate('reportedBy', 'name email')
      .sort({ startTime: -1 });
    res.json({ success: true, count: outages.length, data: outages });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch outages.' }); }
};

export const createOutage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const outage = await Outage.create({ ...req.body, reportedBy: req.user?._id });
    res.status(201).json({ success: true, data: outage });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to create outage.' });
  }
};

export const getOutageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const outage = await Outage.findById(req.params.id)
      .populate('towerId', 'name towerId')
      .populate('reportedBy', 'name email');
    if (!outage) { res.status(404).json({ success: false, message: 'Outage not found.' }); return; }
    res.json({ success: true, data: outage });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch outage.' }); }
};

export const updateOutage = async (req: Request, res: Response): Promise<void> => {
  try {
    const outage = await Outage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!outage) { res.status(404).json({ success: false, message: 'Outage not found.' }); return; }
    res.json({ success: true, data: outage });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to update outage.' });
  }
};

export const deleteOutage = async (req: Request, res: Response): Promise<void> => {
  try {
    const outage = await Outage.findByIdAndDelete(req.params.id);
    if (!outage) { res.status(404).json({ success: false, message: 'Outage not found.' }); return; }
    res.json({ success: true, message: 'Outage deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to delete outage.' }); }
};
