import { Request, Response } from 'express';
import { Alert } from '../models/Alert';
import { AuthRequest } from '../middleware/auth';

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { towerId, status, severity, type } = req.query;
    const filter: Record<string, unknown> = {};
    if (towerId) filter.towerId = towerId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (type) filter.type = type;
    const alerts = await Alert.find(filter)
      .populate('towerId', 'name towerId')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch alerts.' }); }
};

export const createAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json({ success: true, data: alert });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to create alert.' });
  }
};

export const getAlertById = async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findById(req.params.id).populate('towerId', 'name towerId');
    if (!alert) { res.status(404).json({ success: false, message: 'Alert not found.' }); return; }
    res.json({ success: true, data: alert });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to fetch alert.' }); }
};

export const updateAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const update = { ...req.body };
    if (update.status === 'RESOLVED') {
      update.resolvedAt = new Date();
      update.resolvedBy = req.user?._id;
    }
    const alert = await Alert.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!alert) { res.status(404).json({ success: false, message: 'Alert not found.' }); return; }
    res.json({ success: true, data: alert });
  } catch (e) {
    res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Failed to update alert.' });
  }
};

export const deleteAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) { res.status(404).json({ success: false, message: 'Alert not found.' }); return; }
    res.json({ success: true, message: 'Alert deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to delete alert.' }); }
};
