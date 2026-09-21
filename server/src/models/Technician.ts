import mongoose, { Document, Schema } from 'mongoose';

export type TechnicianStatus = 'AVAILABLE' | 'ASSIGNED' | 'ON_LEAVE' | 'OFFLINE';

export interface ITechnician extends Document {
  technicianId: string;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  assignedTowers: mongoose.Types.ObjectId[];
  status: TechnicianStatus;
  certifications?: string[];
  yearsOfExperience?: number;
  createdAt: Date;
  updatedAt: Date;
}

const technicianSchema = new Schema<ITechnician>(
  {
    technicianId: {
      type: String,
      required: [true, 'Technician ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    specialization: [{ type: String, trim: true }],
    assignedTowers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tower',
      },
    ],
    status: {
      type: String,
      enum: ['AVAILABLE', 'ASSIGNED', 'ON_LEAVE', 'OFFLINE'],
      default: 'AVAILABLE',
    },
    certifications: [{ type: String, trim: true }],
    yearsOfExperience: { type: Number, min: 0 },
  },
  { timestamps: true }
);

technicianSchema.index({ status: 1 });
technicianSchema.index({ email: 1 });

export const Technician = mongoose.model<ITechnician>('Technician', technicianSchema);
