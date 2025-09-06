// Setup script to initialize the database with sample data
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');

// Connect to database
mongoose.connect('mongodb://localhost:27017/doctor_appointment', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Create default admin
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new Admin({
        username: 'admin',
        email: 'admin@healthcareplus.com',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'Super Admin',
        permissions: ['manage_doctors', 'manage_patients', 'manage_appointments', 'view_reports', 'system_settings']
      });
      await admin.save();
      console.log('Default admin created (username: admin, password: admin123)');
    }

    // Create sample doctors
    const doctorsData = [
      {
        name: 'John Smith',
        specialization: 'Cardiology',
        department: 'Cardiology',
        qualification: 'MBBS, MD Cardiology',
        experience: 15,
        email: 'john.smith@healthcareplus.com',
        phone: '+1-555-0101',
        consultationFee: 150,
        bio: 'Dr. John Smith is a renowned cardiologist with over 15 years of experience in treating heart conditions.',
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '17:00' }
        ]
      },
      {
        name: 'Sarah Johnson',
        specialization: 'Pediatrics',
        department: 'Pediatrics',
        qualification: 'MBBS, MD Pediatrics',
        experience: 12,
        email: 'sarah.johnson@healthcareplus.com',
        phone: '+1-555-0102',
        consultationFee: 120,
        bio: 'Dr. Sarah Johnson specializes in pediatric care and has been treating children for over a decade.',
        availableSlots: [
          { day: 'Monday', startTime: '10:00', endTime: '18:00' },
          { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
          { day: 'Friday', startTime: '10:00', endTime: '16:00' }
        ]
      },
      {
        name: 'Michael Brown',
        specialization: 'Orthopedics',
        department: 'Orthopedics',
        qualification: 'MBBS, MS Orthopedics',
        experience: 18,
        email: 'michael.brown@healthcareplus.com',
        phone: '+1-555-0103',
        consultationFee: 180,
        bio: 'Dr. Michael Brown is an expert orthopedic surgeon specializing in joint replacements and sports injuries.',
        availableSlots: [
          { day: 'Monday', startTime: '08:00', endTime: '16:00' },
          { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Wednesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
          { day: 'Friday', startTime: '08:00', endTime: '14:00' }
        ]
      },
      {
        name: 'Emily Davis',
        specialization: 'Dermatology',
        department: 'Dermatology',
        qualification: 'MBBS, MD Dermatology',
        experience: 10,
        email: 'emily.davis@healthcareplus.com',
        phone: '+1-555-0104',
        consultationFee: 130,
        bio: 'Dr. Emily Davis is a skilled dermatologist with expertise in both medical and cosmetic dermatology.',
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '17:00' },
          { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
        ]
      },
      {
        name: 'Robert Wilson',
        specialization: 'Neurology',
        department: 'Neurology',
        qualification: 'MBBS, DM Neurology',
        experience: 20,
        email: 'robert.wilson@healthcareplus.com',
        phone: '+1-555-0105',
        consultationFee: 200,
        bio: 'Dr. Robert Wilson is a leading neurologist with extensive experience in treating neurological disorders.',
        availableSlots: [
          { day: 'Monday', startTime: '10:00', endTime: '16:00' },
          { day: 'Tuesday', startTime: '10:00', endTime: '16:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '16:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '16:00' },
          { day: 'Friday', startTime: '10:00', endTime: '14:00' }
        ]
      }
    ];

    for (const doctorData of doctorsData) {
      const existingDoctor = await Doctor.findOne({ email: doctorData.email });
      if (!existingDoctor) {
        const doctor = new Doctor(doctorData);
        await doctor.save();
        console.log(`Doctor ${doctorData.name} created`);
      }
    }

    console.log('Database setup completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: username = admin, password = admin123');
    console.log('\nTo create a patient account, use the registration form on the website.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();