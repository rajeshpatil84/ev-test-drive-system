import moment, { Moment } from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { HydratedDocument } from 'mongoose';
import Vehicle, { IVehicle } from '../models/Vehicle';
import Reservation, { IReservation } from '../models/Reservation';

const DAYS_MAPPING: Record<number, string> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thur',
  5: 'fri',
  6: 'sat',
};

export interface AvailableVehicle {
  id: string;
  type: string;
  location: string;
}

export interface BookingData {
  vehicleId: string;
  startDateTime: string;
  durationMins: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export interface ReservationSummary {
  id: string;
  vehicleId: string;
  startDateTime: string;
  endDateTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  status: string;
}

export interface BookingResult {
  success: boolean;
  message: string;
  reservation?: ReservationSummary;
}

const hasTimeConflict = (
  reservation: HydratedDocument<IReservation>,
  requestStart: Moment,
  requestEnd: Moment,
  bufferMins: number
): boolean => {
  const resStart = moment.utc(reservation.startDateTime);
  const resEnd = moment.utc(reservation.endDateTime);
  const bufferStart = resStart.clone().subtract(bufferMins, 'minutes');
  const bufferEnd = resEnd.clone().add(bufferMins, 'minutes');
  return requestStart.isBefore(bufferEnd) && requestEnd.isAfter(bufferStart);
};

export const getAvailableVehicles = async (
  vehicleType: string,
  location: string,
  startDateTime: string,
  durationMins: number
): Promise<AvailableVehicle[]> => {
  const startMoment = moment.utc(startDateTime);
  const endMoment = moment.utc(startDateTime).add(durationMins, 'minutes');
  const dayOfWeek = DAYS_MAPPING[startMoment.day()];

  const matchingVehicles = await Vehicle.find({
    type: vehicleType,
    location: location.toLowerCase(),
    isActive: true,
  });

  const available: AvailableVehicle[] = [];

  for (const vehicle of matchingVehicles) {
    if (!vehicle.availableDays.includes(dayOfWeek)) continue;

    const availableFrom = moment.utc(
      `${startMoment.format('YYYY-MM-DD')} ${vehicle.availableFromTime}`
    );
    const availableTo = moment.utc(
      `${startMoment.format('YYYY-MM-DD')} ${vehicle.availableToTime}`
    );

    if (startMoment.isBefore(availableFrom) || endMoment.isAfter(availableTo)) continue;

    const conflicting = await Reservation.find({
      vehicleId: vehicle.id,
      status: 'confirmed',
      $or: [{ startDateTime: { $lt: endMoment.toDate() }, endDateTime: { $gt: startMoment.toDate() } }],
    });

    const hasConflict = conflicting.some((res) =>
      hasTimeConflict(res, startMoment, endMoment, vehicle.minimumMinutesBetweenBookings)
    );

    if (!hasConflict) {
      available.push({ id: vehicle.id, type: vehicle.type, location: vehicle.location });
    }
  }

  // Sort by total confirmed booking count ascending to distribute evenly
  const withCounts = await Promise.all(
    available.map(async (v) => {
      const bookingCount = await Reservation.countDocuments({ vehicleId: v.id, status: 'confirmed' });
      return { ...v, bookingCount };
    })
  );

  withCounts.sort((a, b) => a.bookingCount - b.bookingCount);

  return withCounts.map(({ id, type, location }) => ({ id, type, location }));
};

export const scheduleTestDrive = async (data: BookingData): Promise<BookingResult> => {
  const { vehicleId, startDateTime, durationMins, customerName, customerPhone, customerEmail } = data;

  if (!vehicleId || !startDateTime || !durationMins || !customerName || !customerPhone || !customerEmail) {
    return { success: false, message: 'Missing required fields' };
  }

  const vehicle = await Vehicle.findOne({ id: vehicleId, isActive: true });
  if (!vehicle) {
    return { success: false, message: 'Vehicle not found' };
  }

  const startMoment = moment.utc(startDateTime);
  const endMoment = startMoment.clone().add(durationMins, 'minutes');

  const availableVehicles = await getAvailableVehicles(
    vehicle.type,
    vehicle.location,
    startDateTime,
    durationMins
  );

  if (!availableVehicles.find((v) => v.id === vehicleId)) {
    return { success: false, message: 'Vehicle is not available for the requested time slot' };
  }

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
    status: 'confirmed',
  });

  await newReservation.save();

  return {
    success: true,
    message: 'Test drive scheduled successfully',
    reservation: {
      id: newReservation.id as string,
      vehicleId: newReservation.vehicleId,
      startDateTime: newReservation.startDateTime.toISOString(),
      endDateTime: newReservation.endDateTime.toISOString(),
      customerName: newReservation.customerName,
      customerEmail: newReservation.customerEmail,
      customerPhone: newReservation.customerPhone,
      bookingDate: newReservation.bookingDate.toISOString(),
      status: newReservation.status,
    },
  };
};

export const getVehicleReservations = async (vehicleId: string): Promise<ReservationSummary[]> => {
  const reservations = await Reservation.find(
    { vehicleId, status: 'confirmed' },
    null,
    { sort: { startDateTime: 1 } }
  );

  return reservations.map((res) => ({
    id: res.id as string,
    vehicleId: res.vehicleId,
    startDateTime: res.startDateTime.toISOString(),
    endDateTime: res.endDateTime.toISOString(),
    customerName: res.customerName,
    customerEmail: res.customerEmail,
    customerPhone: res.customerPhone,
    bookingDate: res.bookingDate.toISOString(),
    status: res.status,
  }));
};

export const getAllVehicles = async (): Promise<HydratedDocument<IVehicle>[]> => {
  return Vehicle.find({ isActive: true });
};

export const getVehicleById = async (
  vehicleId: string
): Promise<HydratedDocument<IVehicle> | null> => {
  return Vehicle.findOne({ id: vehicleId, isActive: true });
};
