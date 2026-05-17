import React from 'react';
import TestDriveBooking from './components/TestDriveBooking';
import './App.css';

function App() {
  return (
    <div className="App">
      <TestDriveBooking 
        vehicleType="tesla_model3" 
        location="dublin" 
        apiBaseUrl="http://localhost:5000"
      />
    </div>
  );
}

export default App;
