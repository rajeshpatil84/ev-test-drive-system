const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Reservation = require('../models/Reservation');

const initializeDatabase = async () => {
  try {
    // Check if vehicles already exist
    const vehicleCount = await Vehicle.countDocuments();
    
    if (vehicleCount === 0) {
      console.log('📦 Seeding vehicles...');
      
      const vehicles = [
        {
          id: 'tesla_1001',
          type: 'tesla_model3',
          location: 'dublin',
          availableFromTime: '08:00:00',
          availableToTime: '18:00:00',
          availableDays: ['mon', 'tue', 'wed', 'thur', 'fri'],
          minimumMinutesBetweenBookings: 15
        },
        {
          id: 'tesla_1002',
          type: 'tesla_modelx',
          location: 'dublin',
          availableFromTime: '10:00:00',
          availableToTime: '20:00:00',
          availableDays: ['mon', 'tue', 'wed', 'thur', 'fri', 'sat'],
          minimumMinutesBetweenBookings: 15
        },
        {
          id: 'tesla_1003',
          type: 'tesla_modely',
          location: 'dublin',
          availableFromTime: '10:00:00',
          availableToTime: '16:00:00',
          availableDays: ['fri', 'sat', 'sun'],
          minimumMinutesBetweenBookings: 15
        },
        {
          id: 'tesla_1004',
          type: 'tesla_model3',
          location: 'cork',
          availableFromTime: '08:00:00',
          availableToTime: '18:00:00',
          availableDays: ['mon', 'tue', 'wed', 'thur', 'fri'],
          minimumMinutesBetweenBookings: 15
        },
        {
          id: 'tesla_1005',
          type: 'tesla_modelx',
          location: 'cork',
          availableFromTime: '10:00:00',
          availableToTime: '20:00:00',
          availableDays: ['mon', 'tue', 'wed', 'thur', 'fri', 'sat'],
          minimumMinutesBetweenBookings: 15
        },
        {
          id: 'tesla_1006',
          type: 'tesla_modely',
          location: 'cork',
          availableFromTime: '10:00:00',
          availableToTime: '16:00:00',
          availableDays: ['fri', 'sat', 'sun'],
          minimumMinutesBetweenBookings: 15
        }
      ];

      await Vehicle.insertMany(vehicles);
      console.log('✅ Vehicles seeded successfully');
    } else {
      console.log(`✅ Vehicles already exist (${vehicleCount} vehicles found)`);
    }

    // Check if reservations already exist
    const reservationCount = await Reservation.countDocuments();
    
    if (reservationCount === 0) {
      console.log('📦 Seeding sample reservations...');
      
      const reservations = [
        {
          id: '18726',
          vehicleId: 'tesla_1001',
          startDateTime: new Date('2023-10-18T09:00:00Z'),
          endDateTime: new Date('2023-10-18T09:45:00Z'),
          customerName: 'John Smith',
          customerEmail: 'john@smith.com',
          customerPhone: '+353851234567',
          bookingDate: new Date('2023-10-17T15:30:00Z'),
          status: 'confirmed'
        },
        {
          id: '18727',
          vehicleId: 'tesla_1001',
          startDateTime: new Date('2023-10-18T11:30:00Z'),
          endDateTime: new Date('2023-10-18T12:15:00Z'),
          customerName: 'Jill Jones',
          customerEmail: 'jill@jones.com',
          customerPhone: '+353879876543',
          bookingDate: new Date('2023-10-17T14:00:00Z'),
          status: 'confirmed'
        },
        {
          id: '18728',
          vehicleId: 'tesla_1001',
          startDateTime: new Date('2023-10-18T14:45:00Z'),
          endDateTime: new Date('2023-10-18T15:30:00Z'),
          customerName: 'Jack Brown',
          customerEmail: 'jack@brown.com',
          customerPhone: '+353891234567',
          bookingDate: new Date('2023-10-17T13:00:00Z'),
          status: 'confirmed'
        }
      ];

      await Reservation.insertMany(reservations);
      console.log('✅ Sample reservations seeded successfully');
    } else {
      console.log(`✅ Reservations already exist (${reservationCount} reservations found)`);
    }

    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

module.exports = initializeDatabase;
