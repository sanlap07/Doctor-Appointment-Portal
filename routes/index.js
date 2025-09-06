const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Home page
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true }).limit(6);
    const departments = await Doctor.distinct('department');
    
    res.render('index', {
      title: 'Doctor Appointment System',
      doctors,
      departments
    });
  } catch (error) {
    console.error(error);
    res.render('index', {
      title: 'Doctor Appointment System',
      doctors: [],
      departments: []
    });
  }
});

// Search doctors
router.get('/search', async (req, res) => {
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
    const departments = await Doctor.distinct('department');

    res.render('search-results', {
      title: 'Search Results',
      doctors,
      departments,
      searchQuery: query || '',
      selectedDepartment: department || 'all'
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error searching doctors');
    res.redirect('/');
  }
});

// Doctor details
router.get('/doctor/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      req.flash('error_msg', 'Doctor not found');
      return res.redirect('/');
    }

    res.render('doctor-details', {
      title: `Dr. ${doctor.name}`,
      doctor
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading doctor details');
    res.redirect('/');
  }
});

// About page
router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});

module.exports = router;