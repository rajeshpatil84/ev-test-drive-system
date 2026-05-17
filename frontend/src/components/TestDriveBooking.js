import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import './TestDriveBooking.css';

const TestDriveBooking = ({ vehicleType = 'tesla_model3', location = 'dublin', apiBaseUrl = 'http://localhost:5000' }) => {
  const [formData, setFormData] = useState({
    startDateTime: '',
    durationMins: 45,
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  });

  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [bookingStep, setBookingStep] = useState('availability'); // 'availability' or 'booking'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!formData.startDateTime) {
        setMessage({ type: 'error', text: 'Please select a date and time' });
        setLoading(false);
        return;
      }

      const response = await axios.get(`${apiBaseUrl}/api/availability`, {
        params: {
          vehicleType,
          location,
          startDateTime: formData.startDateTime,
          durationMins: formData.durationMins
        }
      });

      if (response.data.success) {
        setAvailableVehicles(response.data.data.availableVehicles);
        if (response.data.data.availableVehicles.length === 0) {
          setMessage({ type: 'info', text: 'No vehicles available for the selected date and time. Please try another time.' });
        } else {
          setMessage({ type: 'success', text: `Found ${response.data.data.availableVehicles.length} available vehicle(s)!` });
          setSelectedVehicleId(response.data.data.availableVehicles[0].id);
          setBookingStep('booking');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Error checking availability: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate all fields
      if (!selectedVehicleId || !formData.customerName || !formData.customerPhone || !formData.customerEmail) {
        setMessage({ type: 'error', text: 'Please fill in all customer details' });
        setLoading(false);
        return;
      }

      const response = await axios.post(`${apiBaseUrl}/api/bookings`, {
        vehicleId: selectedVehicleId,
        startDateTime: formData.startDateTime,
        durationMins: parseInt(formData.durationMins),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail
      });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `Booking confirmed! Reservation ID: ${response.data.reservation.id}` 
        });
        // Reset form
        setFormData({
          startDateTime: '',
          durationMins: 45,
          customerName: '',
          customerPhone: '',
          customerEmail: ''
        });
        setAvailableVehicles([]);
        setSelectedVehicleId(null);
        setBookingStep('availability');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Booking error: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAvailability = () => {
    setBookingStep('availability');
    setAvailableVehicles([]);
    setSelectedVehicleId(null);
  };

  return (
    <div className="test-drive-container">
      <div className="test-drive-card">
        <h1>EV Test Drive Booking</h1>
        <p className="vehicle-info">
          Vehicle Type: <strong>{vehicleType}</strong> | Location: <strong>{location.toUpperCase()}</strong>
        </p>

        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {bookingStep === 'availability' ? (
          <form onSubmit={handleCheckAvailability} className="availability-form">
            <h2>Step 1: Check Availability</h2>

            <div className="form-group">
              <label htmlFor="startDateTime">Date & Time</label>
              <input
                type="datetime-local"
                id="startDateTime"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleInputChange}
                required
                min={moment.utc().format('YYYY-MM-DDTHH:mm')}
                max={moment.utc().add(14, 'days').format('YYYY-MM-DDTHH:mm')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="durationMins">Duration (minutes)</label>
              <select
                id="durationMins"
                name="durationMins"
                value={formData.durationMins}
                onChange={handleInputChange}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Checking...' : 'Check Availability'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBooking} className="booking-form">
            <h2>Step 2: Complete Your Booking</h2>

            <div className="vehicle-selection">
              <label>Selected Vehicle</label>
              <select
                value={selectedVehicleId || ''}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                {availableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.type} (ID: {vehicle.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="customerName">Full Name</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerPhone">Phone Number</label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="e.g., +353851234567"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerEmail">Email Address</label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <p><strong>Date & Time:</strong> {moment(formData.startDateTime).utc().format('YYYY-MM-DD HH:mm')} UTC</p>
              <p><strong>Duration:</strong> {formData.durationMins} minutes</p>
              <p><strong>Vehicle:</strong> {vehicleType} in {location.toUpperCase()}</p>
            </div>

            <div className="button-group">
              <button type="button" onClick={handleBackToAvailability} className="btn-secondary">
                Back
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TestDriveBooking;
