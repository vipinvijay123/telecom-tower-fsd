import mongoose, { Document, Schema } from 'mongoose';

export type PowerStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
export type GeneratorStatus = 'RUNNING' | 'STANDBY' | 'OFFLINE' | 'FAULT';

export interface IPowerSystem extends Document {
  towerId: mongoose.Types.ObjectId;
  mainPowerStatus: PowerStatus;
  generatorStatus: GeneratorStatus;
  voltage: number;
  current: number;
  powerConsumption: number;
  generatorRuntime: number;
  lastPowerFailure?: Date;
  powerRestorationTime?: Date;
  status: PowerStatus;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const powerSystemSchema = new Schema<IPowerSystem>(
  {
    towerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tower',
      required: [true, 'Tower reference is required'],
    },
    mainPowerStatus: {
      type: String,
      enum: ['NORMAL', 'WARNING', 'CRITICAL', 'OFFLINE'],
      default: 'NORMAL',
    },
    generatorStatus: {
      type: String,
      enum: ['RUNNING', 'STANDBY', 'OFFLINE', 'FAULT'],
      default: 'STANDBY',
    },
    voltage: { type: Number, default: 0 },
    current: { type: Number, default: 0 },
    powerConsumption: { type: Number, default: 0 },
    generatorRuntime: { type: Number, default: 0 },
    lastPowerFailure: { type: Date },
    powerRestorationTime: { type: Date },
    status: {
      type: String,
      enum: ['NORMAL', 'WARNING', 'CRITICAL', 'OFFLINE'],
      default: 'NORMAL',
    },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

powerSystemSchema.index({ towerId: 1 });

export const PowerSystem = mongoose.model<IPowerSystem>('PowerSystem', powerSystemSchema);
