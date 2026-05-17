const express = require('express');
const cors = require('cors');
const moment = require('moment');
const { getAvailableVehicles, scheduleTestDrive, getVehicleReservations } = require('./services/schedulingService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

/**
 * GET /api/availability
 * Request the availability of vehicles
 * Query params:
 *   - vehicleType: Type of vehicle (e.g., tesla_model3)
 *   - location: Location (e.g., dublin)
 *   - startDateTime: Start time in ISO format
 *   - durationMins: Duration in minutes
 */
app.get('/api/availability', (req, res) => {
  try {
    const { vehicleType, location, startDateTime, durationMins } = req.query;

    // Validate required parameters
    if (!vehicleType || !location || !startDateTime || !durationMins) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: vehicleType, location, startDateTime, durationMins'
      });
    }

    // Validate startDateTime format
    if (!moment.utc(startDateTime, moment.ISO_8601, true).isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDateTime format. Use ISO 8601 format (e.g., 2023-11-01T09:00:00Z)'
      });
    }

    // Validate durationMins
    const duration = parseInt(durationMins);
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'durationMins must be a positive number'
      });
    }

    // Check that the requested date is within 14 days
    const requestedDate = moment.utc(startDateTime);
    const maxDate = moment.utc().add(14, 'days');
    if (requestedDate.isAfter(maxDate)) {
      return res.status(400).json({
        success: false,
        message: 'Bookings are only available for up to 14 days in the future'
      });
    }

    const availableVehicles = getAvailableVehicles(vehicleType, location, startDateTime, duration);

    res.json({
      success: true,
      data: {
        requestedVehicleType: vehicleType,
        location,
        startDateTime,
        durationMins: duration,
        availableVehicles: availableVehicles.map((v) => ({
          id: v.id,
          type: v.type,
          location: v.location
        }))
      }
    });
  } catch (error) {
    console.error('Error in /api/availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * POST /api/bookings
 * Schedule a test drive
 * Body:
 *   - vehicleId: ID of the vehicle
 *   - startDateTime: Start time in ISO format
 *   - durationMins: Duration in minutes
 *   - customerName: Customer name
 *   - customerPhone: Customer phone number
 *   - customerEmail: Customer email address
 */
app.post('/api/bookings', (req, res) => {
  try {
    const { vehicleId, startDateTime, durationMins, customerName, customerPhone, customerEmail } = req.body;

    // Validate required fields
    if (!vehicleId || !startDateTime || !durationMins || !customerName || !customerPhone || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: vehicleId, startDateTime, durationMins, customerName, customerPhone, customerEmail'
      });
    }

    // Validate startDateTime format
    if (!moment.utc(startDateTime, moment.ISO_8601, true).isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDateTime format. Use ISO 8601 format (e.g., 2023-11-01T09:00:00Z)'
      });
    }

    // Validate durationMins
    const duration = parseInt(durationMins);
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'durationMins must be a positive number'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const result = scheduleTestDrive({
      vehicleId,
      startDateTime,
      durationMins: duration,
      customerName,
      customerPhone,
      customerEmail
    });

    if (!result.success) {
      return res.status(409).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in /api/bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/bookings/:vehicleId
 * Get all reservations for a specific vehicle
 */
app.get('/api/bookings/:vehicleId', (req, res) => {
  try {
    const { vehicleId } = req.params;
    const reservations = getVehicleReservations(vehicleId);

    res.json({
      success: true,
      vehicleId,
      reservations
    });
  } catch (error) {
    console.error('Error in /api/bookings/:vehicleId:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
