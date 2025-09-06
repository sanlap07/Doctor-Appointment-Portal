const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Admin = require('../models/Admin');

// Middleware to check if admin is logged in
const requireAdminAuth = (req, res, next) => {
  if (!req.session.admin) {
    req.flash('error_msg', 'Please login as admin to access this page');
    return res.redirect('/auth/admin/login');
  }
  next();
};

// Admin dashboard
router.get('/dashboard', requireAdminAuth, async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments({ isActive: true });
    const totalPatients = await Patient.countDocuments({ isActive: true });
    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });

    const recentAppointments = await Appointment.find()
      .populate('doctor', 'name specialization')
      .populate('patient', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        todayAppointments
      },
      recentAppointments
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/');
  }
});

// Doctors management
router.get('/doctors', requireAdminAuth, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.render('admin/doctors', {
      title: 'Manage Doctors',
      doctors
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading doctors');
    res.redirect('/admin/dashboard');
  }
});

// Add doctor page
router.get('/doctors/add', requireAdminAuth, (req, res) => {
  res.render('admin/add-doctor', {
    title: 'Add New Doctor'
  });
});

// Add doctor handler
router.post('/doctors/add', requireAdminAuth, async (req, res) => {
  try {
    const {
      name, specialization, department, qualification, experience,
      email, phone, consultationFee, bio
    } = req.body;

    const doctor = new Doctor({
      name,
      specialization,
      department,
      qualification,
      experience: parseInt(experience),
      email,
      phone,
      consultationFee: parseFloat(consultationFee),
      bio,
      availableSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
        { day: 'Friday', startTime: '09:00', endTime: '17:00' }
      ]
    });

    await doctor.save();

    req.flash('success_msg', 'Doctor added successfully');
    res.redirect('/admin/doctors');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error adding doctor');
    res.redirect('/admin/doctors/add');
  }
});

// Edit doctor page
router.get('/doctors/edit/:id', requireAdminAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      req.flash('error_msg', 'Doctor not found');
      return res.redirect('/admin/doctors');
    }

    res.render('admin/edit-doctor', {
      title: 'Edit Doctor',
      doctor
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading doctor details');
    res.redirect('/admin/doctors');
  }
});

// Update doctor handler
router.put('/doctors/:id', requireAdminAuth, async (req, res) => {
  try {
    const {
      name, specialization, department, qualification, experience,
      email, phone, consultationFee, bio, isActive
    } = req.body;

    await Doctor.findByIdAndUpdate(req.params.id, {
      name,
      specialization,
      department,
      qualification,
      experience: parseInt(experience),
      email,
      phone,
      consultationFee: parseFloat(consultationFee),
      bio,
      isActive: isActive === 'on'
    });

    req.flash('success_msg', 'Doctor updated successfully');
    res.redirect('/admin/doctors');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error updating doctor');
    res.redirect('/admin/doctors');
  }
});

// Patients management
router.get('/patients', requireAdminAuth, async (req, res) => {
  try {
    const patients = await Patient.find().sort({ firstName: 1 });
    res.render('admin/patients', {
      title: 'Manage Patients',
      patients
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading patients');
    res.redirect('/admin/dashboard');
  }
});

// Appointments management
router.get('/appointments', requireAdminAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor', 'name specialization')
      .populate('patient', 'firstName lastName email')
      .sort({ appointmentDate: -1 });

    res.render('admin/appointments', {
      title: 'Manage Appointments',
      appointments
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading appointments');
    res.redirect('/admin/dashboard');
  }
});

// Update appointment status
router.put('/appointments/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    await Appointment.findByIdAndUpdate(req.params.id, { status });

    req.flash('success_msg', 'Appointment status updated successfully');
    res.redirect('/admin/appointments');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error updating appointment status');
    res.redirect('/admin/appointments');
  }
});

// Developer customization page
router.get('/customization', requireAdminAuth, (req, res) => {
  res.render('admin/customization', {
    title: 'Developer Customization'
  });
});

module.exports = router;