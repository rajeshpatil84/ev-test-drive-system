import { Schema, model } from 'mongoose';

export type ReservationStatus = 'confirmed' | 'completed' | 'cancelled';

export interface IReservation {
  id: string;
  vehicleId: string;
  startDateTime: Date;
  endDateTime: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: Date;
  status: ReservationStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    id: { type: String, required: true, unique: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    startDateTime: { type: Date, required: true, index: true },
    endDateTime: { type: Date, required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true, index: true },
    customerPhone: { type: String, required: true },
    bookingDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

reservationSchema.index({ vehicleId: 1, startDateTime: 1 });
reservationSchema.index({ startDateTime: 1, endDateTime: 1 });
reservationSchema.index({ customerEmail: 1 });

export default model<IReservation>('Reservation', reservationSchema);
