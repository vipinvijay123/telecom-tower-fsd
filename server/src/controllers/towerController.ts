import { Request, Response } from 'express';
import { Tower } from '../models/Tower';

// GET /api/towers
export const getTowers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, city, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (search) {
      filter.$or = [
        { towerId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    const towers = await Tower.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: towers.length, data: towers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch towers.' });
  }
};

// POST /api/towers
export const createTower = async (req: Request, res: Response): Promise<void> => {
  try {
    const tower = await Tower.create(req.body);
    res.status(201).json({ success: true, data: tower });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create tower.' });
    }
  }
};

// GET /api/towers/:id
export const getTowerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const tower = await Tower.findById(req.params.id);
    if (!tower) {
      res.status(404).json({ success: false, message: 'Tower not found.' });
      return;
    }
    res.status(200).json({ success: true, data: tower });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tower.' });
  }
};

// PUT /api/towers/:id
export const updateTower = async (req: Request, res: Response): Promise<void> => {
  try {
    const tower = await Tower.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tower) {
      res.status(404).json({ success: false, message: 'Tower not found.' });
      return;
    }
    res.status(200).json({ success: true, data: tower });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update tower.' });
    }
  }
};

// DELETE /api/towers/:id
export const deleteTower = async (req: Request, res: Response): Promise<void> => {
  try {
    const tower = await Tower.findByIdAndDelete(req.params.id);
    if (!tower) {
      res.status(404).json({ success: false, message: 'Tower not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Tower deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete tower.' });
  }
};
