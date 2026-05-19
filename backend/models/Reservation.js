const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    vehicleId: {
      type: String,
      required: true,
      index: true
    },
    startDateTime: {
      type: Date,
      required: true,
      index: true
    },
    endDateTime: {
      type: Date,
      required: true,
      index: true
    },
    customerName: {
      type: String,
      required: true
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },
    customerPhone: {
      type: String,
      required: true
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for efficient queries
reservationSchema.index({ vehicleId: 1, startDateTime: 1 });
reservationSchema.index({ startDateTime: 1, endDateTime: 1 });
reservationSchema.index({ customerEmail: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
