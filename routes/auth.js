const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');

// Patient login page
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Patient Login' });
});

// Patient login handler
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email, isActive: true });
    if (!patient) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    req.session.user = {
      id: patient._id,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName
    };

    req.flash('success_msg', 'Login successful');
    res.redirect('/appointments/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Login failed');
    res.redirect('/auth/login');
  }
});

// Patient registration page
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Patient Registration' });
});

// Patient registration handler
router.post('/register', async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, confirmPassword,
      phone, dateOfBirth, gender, street, city, state, zipCode
    } = req.body;

    // Validate password confirmation
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect('/auth/register');
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      req.flash('error_msg', 'Email already registered');
      return res.redirect('/auth/register');
    }

    // Create new patient
    const patient = new Patient({
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      address: { street, city, state, zipCode }
    });

    await patient.save();

    req.flash('success_msg', 'Registration successful. Please login.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Registration failed');
    res.redirect('/auth/register');
  }
});

// Admin login page
router.get('/admin/login', (req, res) => {
  res.render('auth/admin-login', { title: 'Admin Login' });
});

// Admin login handler - UPDATED to match your Admin model
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Look for admin by username or email
    const admin = await Admin.findOne({ 
      $or: [{ username }, { email: username }]
    });

    if (!admin) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/auth/admin/login');
    }

    // Use comparePassword method from your Admin model
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/auth/admin/login');
    }

    req.session.admin = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role || 'admin' // Use default if role doesn't exist
    };

    req.flash('success_msg', 'Admin login successful');
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Admin login error:', error);
    req.flash('error_msg', 'Login failed');
    res.redirect('/auth/admin/login');
  }
});

// Admin Registration Route - UPDATED with better error handling
router.post('/admin/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { firstName, lastName, email, username, password, confirmPassword } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !username || !password) {
      req.flash('error_msg', 'All fields are required');
      return res.redirect('/auth/admin/login');
    }

    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect('/auth/admin/login');
    }

    if (password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters long');
      return res.redirect('/auth/admin/login');
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] 
    });

    if (existingAdmin) {
      req.flash('error_msg', 'Admin with this email or username already exists');
      return res.redirect('/auth/admin/login');
    }

    // Create new admin
    const newAdmin = new Admin({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      password: password,
      role: 'admin'
    });

    await newAdmin.save();
    
    console.log('Admin created successfully:', newAdmin.email);
    req.flash('success_msg', 'Admin account created successfully! You can now login.');
    res.redirect('/auth/admin/login');

  } catch (error) {
    console.error('Admin registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      req.flash('error_msg', 'Username or email already exists');
    } else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      req.flash('error_msg', errors.join(', '));
    } else {
      req.flash('error_msg', 'Error creating admin account: ' + error.message);
    }
    
    res.redirect('/auth/admin/login');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

module.exports = router;