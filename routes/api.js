const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// API to get available time slots for a doctor on a specific date
router.get('/doctors/:doctorId/available-slots/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const appointmentDate = new Date(date);
    const dayName = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Get doctor's available slots for the day
    const daySlots = doctor.availableSlots.find(slot => slot.day === dayName);
    
    if (!daySlots) {
      return res.json({ availableSlots: [] });
    }

    // Get existing appointments for the date
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $nin: ['Cancelled', 'Completed'] }
    });

    // Generate time slots (30-minute intervals)
    const slots = [];
    const startTime = daySlots.startTime;
    const endTime = daySlots.endTime;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeSlot = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      
      // Check if this slot is already booked
      const isBooked = existingAppointments.some(appointment => 
        appointment.timeSlot.startTime === timeSlot
      );
      
      if (!isBooked) {
        slots.push(timeSlot);
      }
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin = 0;
      }
    }

    res.json({ availableSlots: slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API to search doctors
router.get('/doctors/search', async (req, res) => {
  try {
    const { query, department } = req.query;
    let searchCriteria = { isActive: true };

    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: 'i' } },
        { specialization: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } }
      ];
    }

    if (department && department !== 'all') {
      searchCriteria.department = department;
    }

    const doctors = await Doctor.find(searchCriteria);
    res.json({ doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;