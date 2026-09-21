import { Request, Response } from 'express';
import { Tower } from '../models/Tower';
import { Asset } from '../models/Asset';
import { Battery } from '../models/Battery';
import { Outage } from '../models/Outage';
import { Maintenance } from '../models/Maintenance';
import { Inspection } from '../models/Inspection';
import { Alert } from '../models/Alert';
import { Technician } from '../models/Technician';

// GET /api/dashboard/stats
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalTowers,
      activeTowers,
      offlineTowers,
      maintenanceTowers,
      criticalTowers,
      totalAssets,
      criticalBatteries,
      activeOutages,
      pendingMaintenance,
      upcomingInspections,
      activeAlerts,
      availableTechnicians,
    ] = await Promise.all([
      Tower.countDocuments(),
      Tower.countDocuments({ status: 'ACTIVE' }),
      Tower.countDocuments({ status: 'OFFLINE' }),
      Tower.countDocuments({ status: 'MAINTENANCE' }),
      Tower.countDocuments({ status: 'CRITICAL' }),
      Asset.countDocuments(),
      Battery.countDocuments({ status: 'CRITICAL' }),
      Outage.countDocuments({ status: { $in: ['ACTIVE', 'INVESTIGATING'] } }),
      Maintenance.countDocuments({ status: { $in: ['SCHEDULED', 'IN_PROGRESS'] } }),
      Inspection.countDocuments({
        status: 'SCHEDULED',
        inspectionDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      }),
      Alert.countDocuments({ status: 'ACTIVE' }),
      Technician.countDocuments({ status: 'AVAILABLE' }),
    ]);

    // Tower status distribution for chart
    const towerStatusDist = [
      { name: 'Active', value: activeTowers, color: '#00ff88' },
      { name: 'Maintenance', value: maintenanceTowers, color: '#f59e0b' },
      { name: 'Offline', value: offlineTowers, color: '#6b7280' },
      { name: 'Critical', value: criticalTowers, color: '#ff4757' },
    ];

    // Battery health distribution
    const [healthyBatteries, warningBatteries] = await Promise.all([
      Battery.countDocuments({ status: 'HEALTHY' }),
      Battery.countDocuments({ status: 'WARNING' }),
    ]);
    const batteryHealthDist = [
      { name: 'Healthy', value: healthyBatteries, color: '#00ff88' },
      { name: 'Warning', value: warningBatteries, color: '#f59e0b' },
      { name: 'Critical', value: criticalBatteries, color: '#ff4757' },
    ];

    res.json({
      success: true,
      data: {
        kpis: {
          totalTowers,
          activeTowers,
          offlineTowers,
          maintenanceTowers,
          criticalTowers,
          totalAssets,
          criticalBatteries,
          activeOutages,
          pendingMaintenance,
          upcomingInspections,
          activeAlerts,
          availableTechnicians,
        },
        charts: {
          towerStatusDist,
          batteryHealthDist,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
  }
};

// GET /api/dashboard/recent
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const [recentAlerts, recentOutages, upcomingInspections, recentMaintenance] =
      await Promise.all([
        Alert.find({ status: 'ACTIVE' })
          .populate('towerId', 'name towerId')
          .sort({ createdAt: -1 })
          .limit(5),
        Outage.find({ status: { $in: ['ACTIVE', 'INVESTIGATING'] } })
          .populate('towerId', 'name towerId')
          .sort({ startTime: -1 })
          .limit(5),
        Inspection.find({
          status: 'SCHEDULED',
          inspectionDate: { $gte: new Date() },
        })
          .populate('towerId', 'name towerId')
          .populate('technicianId', 'name')
          .sort({ inspectionDate: 1 })
          .limit(5),
        Maintenance.find({ status: { $in: ['SCHEDULED', 'IN_PROGRESS'] } })
          .populate('towerId', 'name towerId')
          .sort({ scheduledDate: 1 })
          .limit(5),
      ]);

    res.json({
      success: true,
      data: {
        recentAlerts,
        recentOutages,
        upcomingInspections,
        recentMaintenance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recent activity.' });
  }
};
