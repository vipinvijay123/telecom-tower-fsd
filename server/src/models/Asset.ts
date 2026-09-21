import mongoose, { Document, Schema } from 'mongoose';

export type AssetType =
  | 'ANTENNA'
  | 'ROUTER'
  | 'BASE_STATION'
  | 'GENERATOR'
  | 'POWER_EQUIPMENT'
  | 'BATTERY'
  | 'CABLE'
  | 'SHELTER'
  | 'OTHER';

export type AssetStatus = 'OPERATIONAL' | 'FAULTY' | 'MAINTENANCE' | 'DECOMMISSIONED';

export interface IAsset {
  assetId: string;
  towerId: mongoose.Types.ObjectId;
  assetType: AssetType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: Date;
  status: AssetStatus;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    assetId: {
      type: String,
      required: [true, 'Asset ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    towerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tower',
      required: [true, 'Tower reference is required'],
    },
    assetType: {
      type: String,
      enum: ['ANTENNA', 'ROUTER', 'BASE_STATION', 'GENERATOR', 'POWER_EQUIPMENT', 'BATTERY', 'CABLE', 'SHELTER', 'OTHER'],
      required: [true, 'Asset type is required'],
    },
    manufacturer: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    serialNumber: { type: String, required: true, trim: true, unique: true },
    installationDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['OPERATIONAL', 'FAULTY', 'MAINTENANCE', 'DECOMMISSIONED'],
      default: 'OPERATIONAL',
    },
    lastMaintenanceDate: { type: Date },
    nextMaintenanceDate: { type: Date },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

assetSchema.index({ towerId: 1 });
assetSchema.index({ status: 1 });

export const Asset = mongoose.model<IAsset>('Asset', assetSchema);
