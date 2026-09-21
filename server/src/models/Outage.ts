import mongoose, { Document, Schema } from 'mongoose';

export type OutageSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OutageStatus = 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';

export interface IOutage extends Document {
  outageId: string;
  towerId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  cause?: string;
  severity: OutageSeverity;
  status: OutageStatus;
  reportedBy: mongoose.Types.ObjectId;
  resolutionDetails?: string;
  affectedServices?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const outageSchema = new Schema<IOutage>(
  {
    outageId: {
      type: String,
      required: [true, 'Outage ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    towerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tower',
      required: [true, 'Tower reference is required'],
    },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date },
    durationMinutes: { type: Number },
    cause: { type: String, trim: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INVESTIGATING', 'RESOLVED'],
      default: 'ACTIVE',
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resolutionDetails: { type: String, trim: true },
    affectedServices: [{ type: String }],
  },
  { timestamps: true }
);

// Auto-calculate duration when endTime is set
outageSchema.pre('save', function () {
  if (this.endTime && this.startTime) {
    this.durationMinutes = Math.round(
      (this.endTime.getTime() - this.startTime.getTime()) / 60000
    );
  }
});

outageSchema.index({ towerId: 1 });
outageSchema.index({ status: 1 });
outageSchema.index({ severity: 1 });
outageSchema.index({ startTime: -1 });

export const Outage = mongoose.model<IOutage>('Outage', outageSchema);
