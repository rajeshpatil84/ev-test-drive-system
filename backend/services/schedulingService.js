const moment = require('moment');
const { readJSON, writeJSON } = require('../utils/dataStore');
const { v4: uuidv4 } = require('uuid');

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
const getAvailableVehicles = (vehicleType, location, startDateTime, durationMins) => {
  const vehicles = readJSON('vehicles.json');
  const reservations = readJSON('reservations.json');

  if (!vehicles || !vehicles.vehicles) return [];

  const startMoment = moment.utc(startDateTime);
  const endMoment = moment.utc(startDateTime).add(durationMins, 'minutes');
  const dayOfWeek = DAYS_MAPPING[startMoment.day()];

  // Filter vehicles by type and location
  const matchingVehicles = vehicles.vehicles.filter(
    (v) => v.type === vehicleType && v.location.toLowerCase() === location.toLowerCase()
  );

  // Further filter by availability constraints
  const availableVehicles = matchingVehicles.filter((vehicle) => {
    // Check if day is available
    if (!vehicle.availableDays.includes(dayOfWeek)) {
      return false;
    }

    // Check if time is within operating hours
    const availableFrom = moment.utc(startMoment.format('YYYY-MM-DD') + ' ' + vehicle.availableFromTime);
    const availableTo = moment.utc(startMoment.format('YYYY-MM-DD') + ' ' + vehicle.availableToTime);

    if (startMoment.isBefore(availableFrom) || endMoment.isAfter(availableTo)) {
      return false;
    }

    // Check for existing reservations
    const conflictingReservations = reservations.reservations.filter(
      (res) => res.vehicleId === vehicle.id && hasTimeConflict(res, startMoment, endMoment, vehicle.minimumMinutesBetweenBookings)
    );

    return conflictingReservations.length === 0;
  });

  return availableVehicles;
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
const scheduleTestDrive = (bookingData) => {
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

  const vehicles = readJSON('vehicles.json');
  const reservations = readJSON('reservations.json');

  // Find vehicle
  const vehicle = vehicles.vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) {
    return {
      success: false,
      message: 'Vehicle not found'
    };
  }

  const startMoment = moment.utc(startDateTime);
  const endMoment = startMoment.clone().add(durationMins, 'minutes');

  // Validate availability
  const availableVehicles = getAvailableVehicles(vehicle.type, vehicle.location, startDateTime, durationMins);
  if (!availableVehicles.find((v) => v.id === vehicleId)) {
    return {
      success: false,
      message: 'Vehicle is not available for the requested time slot'
    };
  }

  // Create reservation
  const newReservation = {
    id: uuidv4(),
    vehicleId,
    startDateTime: startMoment.toISOString(),
    endDateTime: endMoment.toISOString(),
    customerName,
    customerEmail: customerEmail.toLowerCase(),
    customerPhone,
    bookingDate: moment.utc().toISOString()
  };

  reservations.reservations.push(newReservation);
  writeJSON('reservations.json', reservations);

  return {
    success: true,
    message: 'Test drive scheduled successfully',
    reservation: newReservation
  };
};

/**
 * Get all reservations for a vehicle
 * @param {string} vehicleId - Vehicle ID
 * @returns {Array} List of reservations
 */
const getVehicleReservations = (vehicleId) => {
  const reservations = readJSON('reservations.json');
  if (!reservations) return [];
  return reservations.reservations.filter((res) => res.vehicleId === vehicleId);
};

module.exports = {
  getAvailableVehicles,
  scheduleTestDrive,
  getVehicleReservations
};
