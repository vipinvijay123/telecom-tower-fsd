import mongoose, { Document, Schema } from 'mongoose';

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MaintenanceType =
  | 'PREVENTIVE'
  | 'CORRECTIVE'
  | 'EMERGENCY'
  | 'ROUTINE'
  | 'UPGRADE';

export interface IMaintenance extends Document {
  maintenanceId: string;
  towerId: mongoose.Types.ObjectId;
  assetId?: mongoose.Types.ObjectId;
  technicianId?: mongoose.Types.ObjectId;
  maintenanceType: MaintenanceType;
  scheduledDate: Date;
  completionDate?: Date;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  description: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceSchema = new Schema<IMaintenance>(
  {
    maintenanceId: {
      type: String,
      required: [true, 'Maintenance ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    towerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tower',
      required: [true, 'Tower reference is required'],
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'Technician',
    },
    maintenanceType: {
      type: String,
      enum: ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'ROUTINE', 'UPGRADE'],
      default: 'PREVENTIVE',
    },
    scheduledDate: { type: Date, required: true },
    completionDate: { type: Date },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    description: { type: String, required: true, trim: true },
    resolution: { type: String, trim: true },
  },
  { timestamps: true }
);

maintenanceSchema.index({ towerId: 1 });
maintenanceSchema.index({ technicianId: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ priority: 1 });
maintenanceSchema.index({ scheduledDate: 1 });

export const Maintenance = mongoose.model<IMaintenance>('Maintenance', maintenanceSchema);
