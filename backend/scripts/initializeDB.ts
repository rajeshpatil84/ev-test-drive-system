import Vehicle, { IVehicle } from '../models/Vehicle';
import Reservation, { IReservation } from '../models/Reservation';

interface VehicleSeed extends Omit<IVehicle, 'createdAt' | 'updatedAt'> {}
interface ReservationSeed extends Omit<IReservation, 'notes' | 'createdAt' | 'updatedAt'> {}

const vehicles: VehicleSeed[] = [
  // Tesla Model 3 - Dublin (2 units for even distribution)
  {
    id: 'tesla_1001', type: 'tesla_model3', location: 'dublin',
    availableFromTime: '08:00:00', availableToTime: '18:00:00',
    availableDays: ['mon', 'tue', 'wed', 'thur', 'fri'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
  {
    id: 'tesla_1007', type: 'tesla_model3', location: 'dublin',
    availableFromTime: '08:00:00', availableToTime: '18:00:00',
    availableDays: ['mon', 'tue', 'wed', 'thur', 'fri'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
  // Tesla Model X - Dublin
  {
    id: 'tesla_1002', type: 'tesla_modelx', location: 'dublin',
    availableFromTime: '10:00:00', availableToTime: '20:00:00',
    availableDays: ['mon', 'tue', 'wed', 'thur', 'fri', 'sat'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
  // Tesla Model Y - Dublin
  {
    id: 'tesla_1003', type: 'tesla_modely', location: 'dublin',
    availableFromTime: '10:00:00', availableToTime: '16:00:00',
    availableDays: ['fri', 'sat', 'sun'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
  // Tesla Model 3 - Cork (2 units for even distribution)
  {
    id: 'tesla_1004', type: 'tesla_model3', location: 'cork',
    availableFromTime: '08:00:00', availableToTime: '18:00:00',
    availableDays: ['mon', 'tue', 'wed', 'thur', 'fri'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
  {
    id: 'tesla_1008', type: 'tesla_model3', location: 'cork',
    availableFromTime: '08:00:00', availableToTime: '18:00:00',
    availableDays: ['mon', 'tue', 'wed', 'thur', 'fri'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
  // Tesla Model X - Cork
  {
    id: 'tesla_1005', type: 'tesla_modelx', location: 'cork',
    availableFromTime: '10:00:00', availableToTime: '20:00:00',
    availableDays: ['mon', 'tue', 'wed', 'thur', 'fri', 'sat'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
  // Tesla Model Y - Cork
  {
    id: 'tesla_1006', type: 'tesla_modely', location: 'cork',
    availableFromTime: '10:00:00', availableToTime: '16:00:00',
    availableDays: ['fri', 'sat', 'sun'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
  // Volkswagen ID4 - Dublin (2 units for even distribution)
  {
    id: 'vw_2001', type: 'volkswagen_id4', location: 'dublin',
    availableFromTime: '09:00:00', availableToTime: '18:00:00',
    availableDays: ['mon', 'tue', 'wed', 'thur', 'fri', 'sat'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
  {
    id: 'vw_2002', type: 'volkswagen_id4', location: 'dublin',
    availableFromTime: '09:00:00', availableToTime: '18:00:00',
    availableDays: ['mon', 'tue', 'wed', 'thur', 'fri', 'sat'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
  // Volkswagen ID4 - Cork (2 units for even distribution)
  {
    id: 'vw_2003', type: 'volkswagen_id4', location: 'cork',
    availableFromTime: '09:00:00', availableToTime: '18:00:00',
    availableDays: ['mon', 'tue', 'wed', 'thur', 'fri', 'sat'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
  {
    id: 'vw_2004', type: 'volkswagen_id4', location: 'cork',
    availableFromTime: '09:00:00', availableToTime: '18:00:00',
    availableDays: ['mon', 'tue', 'wed', 'thur', 'fri', 'sat'],
    minimumMinutesBetweenBookings: 15, isActive: true,
  },
];

const sampleReservations: ReservationSeed[] = [
  {
    id: '18726', vehicleId: 'tesla_1001',
    startDateTime: new Date('2023-10-18T09:00:00Z'),
    endDateTime: new Date('2023-10-18T09:45:00Z'),
    customerName: 'John Smith', customerEmail: 'john@smith.com',
    customerPhone: '+353851234567', bookingDate: new Date('2023-10-17T15:30:00Z'),
    status: 'confirmed',
  },
  {
    id: '18727', vehicleId: 'tesla_1001',
    startDateTime: new Date('2023-10-18T11:30:00Z'),
    endDateTime: new Date('2023-10-18T12:15:00Z'),
    customerName: 'Jill Jones', customerEmail: 'jill@jones.com',
    customerPhone: '+353879876543', bookingDate: new Date('2023-10-17T14:00:00Z'),
    status: 'confirmed',
  },
  {
    id: '18728', vehicleId: 'tesla_1001',
    startDateTime: new Date('2023-10-18T14:45:00Z'),
    endDateTime: new Date('2023-10-18T15:30:00Z'),
    customerName: 'Jack Brown', customerEmail: 'jack@brown.com',
    customerPhone: '+353891234567', bookingDate: new Date('2023-10-17T13:00:00Z'),
    status: 'confirmed',
  },
];

const initializeDatabase = async (): Promise<void> => {
  console.log('📦 Upserting vehicles...');
  for (const vehicle of vehicles) {
    await Vehicle.updateOne({ id: vehicle.id }, { $setOnInsert: vehicle }, { upsert: true });
  }
  console.log(`✅ Vehicles upserted (${vehicles.length} vehicles ensured)`);

  const reservationCount = await Reservation.countDocuments();
  if (reservationCount === 0) {
    console.log('📦 Seeding sample reservations...');
    await Reservation.insertMany(sampleReservations);
    console.log('✅ Sample reservations seeded successfully');
  } else {
    console.log(`✅ Reservations already exist (${reservationCount} reservations found)`);
  }
};

export default initializeDatabase;
