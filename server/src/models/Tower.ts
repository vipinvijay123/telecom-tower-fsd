import mongoose, { Document, Schema } from 'mongoose';

export type TowerStatus = 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE' | 'CRITICAL';
export type TowerType =
  | 'MONOPOLE'
  | 'LATTICE'
  | 'GUYED'
  | 'STEALTH'
  | 'ROOFTOP'
  | 'OTHER';

export interface ITower extends Document {
  towerId: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  towerType: TowerType;
  operator: string;
  installationDate: Date;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
  status: TowerStatus;
  description?: string;
  height?: number;
  createdAt: Date;
  updatedAt: Date;
}

const towerSchema = new Schema<ITower>(
  {
    towerId: {
      type: String,
      required: [true, 'Tower ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Tower name is required'],
      trim: true,
      maxlength: [150, 'Tower name cannot exceed 150 characters'],
    },
    location: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true, default: 'India' },
      latitude: {
        type: Number,
        required: true,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        required: true,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
    towerType: {
      type: String,
      enum: ['MONOPOLE', 'LATTICE', 'GUYED', 'STEALTH', 'ROOFTOP', 'OTHER'],
      default: 'MONOPOLE',
    },
    operator: {
      type: String,
      required: [true, 'Operator name is required'],
      trim: true,
    },
    installationDate: {
      type: Date,
      required: [true, 'Installation date is required'],
    },
    lastInspectionDate: { type: Date },
    nextInspectionDate: { type: Date },
    status: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE', 'OFFLINE', 'CRITICAL'],
      default: 'ACTIVE',
    },
    description: { type: String, trim: true },
    height: { type: Number, min: 0 },
  },
  {
    timestamps: true,
  }
);

towerSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
towerSchema.index({ status: 1 });
towerSchema.index({ towerId: 1 });

export const Tower = mongoose.model<ITower>('Tower', towerSchema);
