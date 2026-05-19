const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const Vehicle = require('../models/Vehicle');
const Reservation = require('../models/Reservation');

const DAYS_MAPPING = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thur',
  5: 'fri',
  6: 'sat'
};

/**
 * Get list of available vehicles for a given criteria
 * @param {string} vehicleType - Type of vehicle (e.g., tesla_model3)
 * @param {string} location - Location (e.g., dublin)
 * @param {string} startDateTime - Start time in ISO format
 * @param {number} durationMins - Duration in minutes
 * @returns {Array} List of available vehicles
 */
const getAvailableVehicles = async (vehicleType, location, startDateTime, durationMins) => {
  try {
    const startMoment = moment.utc(startDateTime);
    const endMoment = moment.utc(startDateTime).add(durationMins, 'minutes');
    const dayOfWeek = DAYS_MAPPING[startMoment.day()];

    // Find vehicles matching type and location
    const matchingVehicles = await Vehicle.find({
      type: vehicleType,
      location: location.toLowerCase(),
      isActive: true
    });

    const availableVehicles = [];

    for (const vehicle of matchingVehicles) {
      // Check if day is available
      if (!vehicle.availableDays.includes(dayOfWeek)) {
        continue;
      }

      // Check if time is within operating hours
      const availableFrom = moment.utc(
        startMoment.format('YYYY-MM-DD') + ' ' + vehicle.availableFromTime
      );
      const availableTo = moment.utc(
        startMoment.format('YYYY-MM-DD') + ' ' + vehicle.availableToTime
      );

      if (startMoment.isBefore(availableFrom) || endMoment.isAfter(availableTo)) {
        continue;
      }

      // Check for existing reservations
      const conflictingReservations = await Reservation.find({
        vehicleId: vehicle.id,
        status: 'confirmed',
        $or: [
          {
            startDateTime: { $lt: endMoment.toDate() },
            endDateTime: { $gt: startMoment.toDate() }
          }
        ]
      });

      // Check buffer time
      let hasConflict = false;
      for (const res of conflictingReservations) {
        if (hasTimeConflict(res, startMoment, endMoment, vehicle.minimumMinutesBetweenBookings)) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        availableVehicles.push({
          id: vehicle.id,
          type: vehicle.type,
          location: vehicle.location
        });
      }
    }

    return availableVehicles;
  } catch (error) {
    console.error('Error in getAvailableVehicles:', error);
    throw error;
  }
};

/**
 * Check if there's a time conflict between a reservation and requested time slot
 * @param {object} reservation - Existing reservation
 * @param {moment} requestStart - Requested start time
 * @param {moment} requestEnd - Requested end time
 * @param {number} bufferMins - Buffer time between bookings
 * @returns {boolean} True if there's a conflict
 */
const hasTimeConflict = (reservation, requestStart, requestEnd, bufferMins) => {
  const resStart = moment.utc(reservation.startDateTime);
  const resEnd = moment.utc(reservation.endDateTime);

  // Add buffer time
  const bufferStart = resStart.clone().subtract(bufferMins, 'minutes');
  const bufferEnd = resEnd.clone().add(bufferMins, 'minutes');

  // Check if there's any overlap
  return requestStart.isBefore(bufferEnd) && requestEnd.isAfter(bufferStart);
};

/**
 * Schedule a test drive (create a reservation)
 * @param {object} bookingData - Booking data
 * @returns {object} Result with success status and reservation details
 */
const scheduleTestDrive = async (bookingData) => {
  try {
    const {
      vehicleId,
      startDateTime,
      durationMins,
      customerName,
      customerPhone,
      customerEmail
    } = bookingData;

    // Validate inputs
    if (!vehicleId || !startDateTime || !durationMins || !customerName || !customerPhone || !customerEmail) {
      return {
        success: false,
        message: 'Missing required fields'
      };
    }

    // Find vehicle
    const vehicle = await Vehicle.findOne({ id: vehicleId, isActive: true });
    if (!vehicle) {
      return {
        success: false,
        message: 'Vehicle not found'
      };
    }

    const startMoment = moment.utc(startDateTime);
    const endMoment = startMoment.clone().add(durationMins, 'minutes');

    // Validate availability
    const availableVehicles = await getAvailableVehicles(
      vehicle.type,
      vehicle.location,
      startDateTime,
      durationMins
    );

    if (!availableVehicles.find((v) => v.id === vehicleId)) {
      return {
        success: false,
        message: 'Vehicle is not available for the requested time slot'
      };
    }

    // Create reservation
    const reservationId = uuidv4();
    const newReservation = new Reservation({
      id: reservationId,
      vehicleId,
      startDateTime: startMoment.toDate(),
      endDateTime: endMoment.toDate(),
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      customerPhone,
      bookingDate: moment.utc().toDate(),
      status: 'confirmed'
    });

    await newReservation.save();

    return {
      success: true,
      message: 'Test drive scheduled successfully',
      reservation: {
        id: newReservation.id,
        vehicleId: newReservation.vehicleId,
        startDateTime: newReservation.startDateTime.toISOString(),
        endDateTime: newReservation.endDateTime.toISOString(),
        customerName: newReservation.customerName,
        customerEmail: newReservation.customerEmail,
        customerPhone: newReservation.customerPhone,
        bookingDate: newReservation.bookingDate.toISOString(),
        status: newReservation.status
      }
    };
  } catch (error) {
    console.error('Error in scheduleTestDrive:', error);
    throw error;
  }
};

/**
 * Get all reservations for a vehicle
 * @param {string} vehicleId - Vehicle ID
 * @returns {Array} List of reservations
 */
const getVehicleReservations = async (vehicleId) => {
  try {
    const reservations = await Reservation.find(
      { vehicleId, status: 'confirmed' },
      null,
      { sort: { startDateTime: 1 } }
    );

    return reservations.map((res) => ({
      id: res.id,
      vehicleId: res.vehicleId,
      startDateTime: res.startDateTime.toISOString(),
      endDateTime: res.endDateTime.toISOString(),
      customerName: res.customerName,
      customerEmail: res.customerEmail,
      customerPhone: res.customerPhone,
      bookingDate: res.bookingDate.toISOString(),
      status: res.status
    }));
  } catch (error) {
    console.error('Error in getVehicleReservations:', error);
    throw error;
  }
};

/**
 * Get all vehicles (for admin purposes)
 * @returns {Array} List of all vehicles
 */
const getAllVehicles = async () => {
  try {
    const vehicles = await Vehicle.find({ isActive: true });
    return vehicles;
  } catch (error) {
    console.error('Error in getAllVehicles:', error);
    throw error;
  }
};

/**
 * Get vehicle by ID
 * @param {string} vehicleId - Vehicle ID
 * @returns {object} Vehicle details
 */
const getVehicleById = async (vehicleId) => {
  try {
    const vehicle = await Vehicle.findOne({ id: vehicleId, isActive: true });
    return vehicle;
  } catch (error) {
    console.error('Error in getVehicleById:', error);
    throw error;
  }
};

module.exports = {
  getAvailableVehicles,
  scheduleTestDrive,
  getVehicleReservations,
  getAllVehicles,
  getVehicleById
};

