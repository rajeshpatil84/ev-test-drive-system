import { Schema, model } from 'mongoose';

export interface IVehicle {
  id: string;
  type: string;
  location: string;
  availableFromTime: string;
  availableToTime: string;
  availableDays: string[];
  minimumMinutesBetweenBookings: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, index: true },
    location: { type: String, required: true, lowercase: true, index: true },
    availableFromTime: { type: String, required: true },
    availableToTime: { type: String, required: true },
    availableDays: { type: [String], required: true },
    minimumMinutesBetweenBookings: { type: Number, required: true, default: 15 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ type: 1, location: 1 });

export default model<IVehicle>('Vehicle', vehicleSchema);
