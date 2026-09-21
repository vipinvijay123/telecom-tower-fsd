import mongoose, { Document, Schema } from 'mongoose';

export type BatteryStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'DEAD';
export type BatteryType = 'VRLA' | 'LITHIUM_ION' | 'NICKEL_CADMIUM' | 'OTHER';

export interface IBattery {
  batteryId: string;
  towerId: mongoose.Types.ObjectId;
  batteryType: BatteryType;
  capacityAh: number;
  currentChargePercent: number;
  voltage: number;
  temperature: number;
  healthPercent: number;
  backupDurationHours: number;
  lastMaintenanceDate?: Date;
  status: BatteryStatus;
  manufacturer?: string;
  model?: string;
  installationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const batterySchema = new Schema<IBattery>(
  {
    batteryId: {
      type: String,
      required: [true, 'Battery ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    towerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tower',
      required: [true, 'Tower reference is required'],
    },
    batteryType: {
      type: String,
      enum: ['VRLA', 'LITHIUM_ION', 'NICKEL_CADMIUM', 'OTHER'],
      default: 'VRLA',
    },
    capacityAh: { type: Number, required: true, min: 0 },
    currentChargePercent: { type: Number, default: 100, min: 0, max: 100 },
    voltage: { type: Number, default: 0 },
    temperature: { type: Number, default: 25 },
    healthPercent: { type: Number, default: 100, min: 0, max: 100 },
    backupDurationHours: { type: Number, default: 0 },
    lastMaintenanceDate: { type: Date },
    status: {
      type: String,
      enum: ['HEALTHY', 'WARNING', 'CRITICAL', 'DEAD'],
      default: 'HEALTHY',
    },
    manufacturer: { type: String, trim: true },
    model: { type: String, trim: true },
    installationDate: { type: Date },
  },
  { timestamps: true }
);

batterySchema.index({ towerId: 1 });
batterySchema.index({ status: 1 });

export const Battery = mongoose.model<IBattery>('Battery', batterySchema);
