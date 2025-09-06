const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error_msg', 'Please login to access this page');
    return res.redirect('/auth/login');
  }
  next();
};

// Patient dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.session.user.id })
      .populate('doctor')
      .sort({ appointmentDate: -1 });

    res.render('appointments/dashboard', {
      title: 'My Dashboard',
      appointments
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/');
  }
});

// Book appointment page
router.get('/book/:doctorId', requireAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    
    if (!doctor) {
      req.flash('error_msg', 'Doctor not found');
      return res.redirect('/');
    }

    res.render('appointments/book', {
      title: `Book Appointment with Dr. ${doctor.name}`,
      doctor
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading booking page');
    res.redirect('/');
  }
});

// Handle appointment booking
router.post('/book/:doctorId', requireAuth, async (req, res) => {
  try {
    const {
      appointmentDate,
      timeSlot,
      reason,
      symptoms,
      consultationType
    } = req.body;

    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      req.flash('error_msg', 'Doctor not found');
      return res.redirect('/');
    }

    // ✅ ADDED VALIDATION: Check if timeSlot is provided and valid
    if (!timeSlot || typeof timeSlot !== 'string' || !timeSlot.includes(':')) {
      req.flash('error_msg', 'Please select a valid time slot');
      return res.redirect(`/appointments/book/${req.params.doctorId}`);
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: req.params.doctorId,
      appointmentDate: new Date(appointmentDate),
      'timeSlot.startTime': timeSlot,
      status: { $nin: ['Cancelled', 'Completed'] }
    });

    if (existingAppointment) {
      req.flash('error_msg', 'This time slot is already booked');
      return res.redirect(`/appointments/book/${req.params.doctorId}`);
    }

    // ✅ ADDED SAFETY: Validate time format before splitting
    const timeParts = timeSlot.split(':');
    if (timeParts.length !== 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) {
      req.flash('error_msg', 'Invalid time format');
      return res.redirect(`/appointments/book/${req.params.doctorId}`);
    }

    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    // ✅ ADDED VALIDATION: Check if hours and minutes are valid
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      req.flash('error_msg', 'Invalid time values');
      return res.redirect(`/appointments/book/${req.params.doctorId}`);
    }

    // Calculate end time (assuming 30-minute slots)
    const endTime = `${String(hours + (minutes + 30 >= 60 ? 1 : 0)).padStart(2, '0')}:${String((minutes + 30) % 60).padStart(2, '0')}`;

    const appointment = new Appointment({
      patient: req.session.user.id,
      doctor: req.params.doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot: {
        startTime: timeSlot,
        endTime: endTime
      },
      reason,
      symptoms,
      consultationType,
      consultationFee: doctor.consultationFee
    });

    await appointment.save();

    req.flash('success_msg', 'Appointment booked successfully');
    res.redirect('/appointments/dashboard');
  } catch (error) {
    console.error('Booking error:', error);
    req.flash('error_msg', 'Error booking appointment');
    res.redirect(`/appointments/book/${req.params.doctorId}`);
  }
});

// View appointment details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.session.user.id
    }).populate('doctor').populate('patient');

    if (!appointment) {
      req.flash('error_msg', 'Appointment not found');
      return res.redirect('/appointments/dashboard');
    }

    res.render('appointments/details', {
      title: 'Appointment Details',
      appointment
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading appointment details');
    res.redirect('/appointments/dashboard');
  }
});

// Cancel appointment
router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.session.user.id
    });

    if (!appointment) {
      req.flash('error_msg', 'Appointment not found');
      return res.redirect('/appointments/dashboard');
    }

    if (appointment.status === 'Cancelled') {
      req.flash('error_msg', 'Appointment is already cancelled');
      return res.redirect('/appointments/dashboard');
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    req.flash('success_msg', 'Appointment cancelled successfully');
    res.redirect('/appointments/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error cancelling appointment');
    res.redirect('/appointments/dashboard');
  }
});

module.exports = router;