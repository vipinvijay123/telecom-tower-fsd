import mongoose, { Document, Schema } from 'mongoose';

export type InspectionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type ConditionRating = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

export interface IInspection extends Document {
  inspectionId: string;
  towerId: mongoose.Types.ObjectId;
  technicianId: mongoose.Types.ObjectId;
  inspectionDate: Date;
  structuralCondition: ConditionRating;
  equipmentCondition: ConditionRating;
  powerCondition: ConditionRating;
  safetyCondition: ConditionRating;
  notes?: string;
  status: InspectionStatus;
  completedAt?: Date;
  findings?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inspectionSchema = new Schema<IInspection>(
  {
    inspectionId: {
      type: String,
      required: [true, 'Inspection ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    towerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tower',
      required: [true, 'Tower reference is required'],
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'Technician',
      required: [true, 'Technician reference is required'],
    },
    inspectionDate: { type: Date, required: true },
    structuralCondition: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'],
      default: 'GOOD',
    },
    equipmentCondition: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'],
      default: 'GOOD',
    },
    powerCondition: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'],
      default: 'GOOD',
    },
    safetyCondition: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'],
      default: 'GOOD',
    },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
      default: 'SCHEDULED',
    },
    completedAt: { type: Date },
    findings: { type: String, trim: true },
  },
  { timestamps: true }
);

inspectionSchema.index({ towerId: 1 });
inspectionSchema.index({ technicianId: 1 });
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ inspectionDate: 1 });

export const Inspection = mongoose.model<IInspection>('Inspection', inspectionSchema);
