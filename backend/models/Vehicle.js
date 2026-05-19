const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      index: true
    },
    location: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },
    availableFromTime: {
      type: String,
      required: true
    },
    availableToTime: {
      type: String,
      required: true
    },
    availableDays: {
      type: [String],
      required: true
    },
    minimumMinutesBetweenBookings: {
      type: Number,
      required: true,
      default: 15
    },
    isActive: {
      type: Boolean,
      default: true
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
vehicleSchema.index({ type: 1, location: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
