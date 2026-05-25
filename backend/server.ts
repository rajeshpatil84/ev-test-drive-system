import express, { Request, Response } from 'express';
import cors from 'cors';
import moment from 'moment';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db';
import initializeDatabase from './scripts/initializeDB';
import {
  getAvailableVehicles,
  scheduleTestDrive,
  getVehicleReservations,
  getAllVehicles,
} from './services/schedulingService';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.set('etag', false);
app.use(cors());
app.use(express.json());

const startServer = async (): Promise<void> => {
  await connectDB();
  await initializeDatabase();

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'Server is running',
      database: 'Connected',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/availability
   * Check vehicle availability for a given type, location, and time slot.
   * Returns vehicles sorted by booking count ascending (even distribution).
   */
  app.get('/api/availability', async (req: Request, res: Response) => {
    try {
      const { vehicleType, location, startDateTime, durationMins } = req.query as Record<string, string>;

      if (!vehicleType || !location || !startDateTime || !durationMins) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: vehicleType, location, startDateTime, durationMins',
        });
      }

      if (!moment.utc(startDateTime, moment.ISO_8601, true).isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDateTime format. Use ISO 8601 (e.g. 2023-11-01T09:00:00Z)',
        });
      }

      const duration = parseInt(durationMins);
      if (isNaN(duration) || duration <= 0) {
        return res.status(400).json({ success: false, message: 'durationMins must be a positive number' });
      }

      if (moment.utc(startDateTime).isBefore(moment.utc())) {
        return res.status(400).json({ success: false, message: 'startDateTime must be in the future' });
      }

      if (moment.utc(startDateTime).isAfter(moment.utc().add(14, 'days'))) {
        return res.status(400).json({
          success: false,
          message: 'Bookings are only available for up to 14 days in the future',
        });
      }

      const availableVehicles = await getAvailableVehicles(vehicleType, location, startDateTime, duration);

      return res.json({
        success: true,
        data: { requestedVehicleType: vehicleType, location, startDateTime, durationMins: duration, availableVehicles },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error', error: (error as Error).message });
    }
  });

  /**
   * POST /api/bookings
   * Schedule a test drive for a specific vehicle and customer.
   */
  app.post('/api/bookings', async (req: Request, res: Response) => {
    try {
      const { vehicleId, startDateTime, durationMins, customerName, customerPhone, customerEmail } = req.body as Record<string, string>;

      if (!vehicleId || !startDateTime || !durationMins || !customerName || !customerPhone || !customerEmail) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: vehicleId, startDateTime, durationMins, customerName, customerPhone, customerEmail',
        });
      }

      if (!moment.utc(startDateTime, moment.ISO_8601, true).isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDateTime format. Use ISO 8601 (e.g. 2023-11-01T09:00:00Z)',
        });
      }

      const duration = parseInt(durationMins);
      if (isNaN(duration) || duration <= 0) {
        return res.status(400).json({ success: false, message: 'durationMins must be a positive number' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }

      if (moment.utc(startDateTime).isBefore(moment.utc())) {
        return res.status(400).json({ success: false, message: 'startDateTime must be in the future' });
      }

      if (moment.utc(startDateTime).isAfter(moment.utc().add(14, 'days'))) {
        return res.status(400).json({
          success: false,
          message: 'Bookings are only available for up to 14 days in the future',
        });
      }

      const result = await scheduleTestDrive({
        vehicleId,
        startDateTime,
        durationMins: duration,
        customerName,
        customerPhone,
        customerEmail,
      });

      if (!result.success) return res.status(409).json(result);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error', error: (error as Error).message });
    }
  });

  /**
   * GET /api/bookings/:vehicleId
   * Get all confirmed reservations for a vehicle.
   */
  app.get('/api/bookings/:vehicleId', async (req: Request, res: Response) => {
    try {
      const { vehicleId } = req.params;
      const reservations = await getVehicleReservations(vehicleId);
      return res.json({ success: true, vehicleId, reservations });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error', error: (error as Error).message });
    }
  });

  /**
   * GET /api/vehicles
   * Return all active vehicles (admin).
   */
  app.get('/api/vehicles', async (_req: Request, res: Response) => {
    try {
      const vehicles = await getAllVehicles();
      return res.json({
        success: true,
        vehicles: vehicles.map((v) => ({
          id: v.id,
          type: v.type,
          location: v.location,
          availableFromTime: v.availableFromTime,
          availableToTime: v.availableToTime,
          availableDays: v.availableDays,
          minimumMinutesBetweenBookings: v.minimumMinutesBetweenBookings,
          isActive: v.isActive,
        })),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error', error: (error as Error).message });
    }
  });

  app.listen(PORT, () => {
    console.log(`\n✅ Server is running on http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🚗 API Available at: http://localhost:${PORT}/api\n`);
  });
};

startServer();
