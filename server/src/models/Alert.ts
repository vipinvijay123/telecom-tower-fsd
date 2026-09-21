import mongoose, { Document, Schema } from 'mongoose';

export type AlertType =
  | 'TOWER_OFFLINE'
  | 'BATTERY_CRITICAL'
  | 'POWER_FAILURE'
  | 'MAINTENANCE_OVERDUE'
  | 'INSPECTION_OVERDUE'
  | 'EQUIPMENT_FAULT'
  | 'OUTAGE_PROLONGED'
  | 'TEMPERATURE_HIGH'
  | 'CUSTOM';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface IAlert extends Document {
  alertId: string;
  type: AlertType;
  towerId: mongoose.Types.ObjectId;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    alertId: {
      type: String,
      required: [true, 'Alert ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'TOWER_OFFLINE',
        'BATTERY_CRITICAL',
        'POWER_FAILURE',
        'MAINTENANCE_OVERDUE',
        'INSPECTION_OVERDUE',
        'EQUIPMENT_FAULT',
        'OUTAGE_PROLONGED',
        'TEMPERATURE_HIGH',
        'CUSTOM',
      ],
      required: true,
    },
    towerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tower',
      required: [true, 'Tower reference is required'],
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      default: 'MEDIUM',
    },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'ACTIVE',
    },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

alertSchema.index({ towerId: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ createdAt: -1 });

export const Alert = mongoose.model<IAlert>('Alert', alertSchema);
