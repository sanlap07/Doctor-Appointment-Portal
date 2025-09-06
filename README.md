# Doctor Appointment System

A comprehensive web-based doctor appointment booking system built with Node.js, Express, MongoDB, and Bootstrap.

## Features

- **Patient Features:**
  - User registration and login
  - Search doctors by name, specialization, or department
  - View doctor profiles and availability
  - Book appointments online
  - Manage appointments (view, cancel)
  - Patient dashboard

- **Admin Features:**
  - Admin login and dashboard
  - Manage doctors (add, edit, view)
  - Manage patients
  - Manage appointments
  - System statistics and reports
  - Developer customization tools

- **System Features:**
  - Responsive design with Bootstrap
  - Real-time availability checking
  - Session-based authentication
  - RESTful API endpoints
  - MongoDB local database
  - Search functionality with navbar

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (local)
- **Frontend:** EJS templating, Bootstrap 5, JavaScript
- **Authentication:** Session-based with bcrypt
- **Styling:** Custom CSS with Bootstrap

## Installation & Setup

1. **Prerequisites:**
   ```bash
   - Node.js (v14 or higher)
   - MongoDB (local installation)
   - npm or yarn package manager
   ```

2. **Clone and Install:**
   ```bash
   git clone <repository-url>
   cd doctor-appointment-system
   npm install
   ```

3. **Start MongoDB:**
   ```bash
   # Start MongoDB service (varies by OS)
   # Windows: net start MongoDB
   # macOS/Linux: sudo systemctl start mongod
   mongod
   ```

4. **Setup Database:**
   ```bash
   node scripts/setup.js
   ```

5. **Start the Application:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the Application:**
   - Open browser and go to `http://localhost:3000`
   - Admin login: username = `admin`, password = `admin123`

## Project Structure

```
├── models/                 # Database models
│   ├── Doctor.js
│   ├── Patient.js
│   ├── Appointment.js
│   └── Admin.js
├── routes/                 # Route handlers
│   ├── index.js
│   ├── auth.js
│   ├── appointments.js
│   ├── admin.js
│   └── api.js
├── views/                  # EJS templates
│   ├── layout.ejs
│   ├── index.ejs
│   ├── auth/
│   ├── appointments/
│   └── admin/
├── public/                 # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── scripts/                # Utility scripts
│   └── setup.js
├── app.js                  # Main application file
└── package.json
```

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Home page | No |
| GET | `/search` | Search doctors | No |
| GET | `/doctor/:id` | Doctor details | No |
| POST | `/auth/login` | Patient login | No |
| POST | `/auth/register` | Patient registration | No |
| GET | `/appointments/dashboard` | Patient dashboard | Patient |
| POST | `/appointments/book/:doctorId` | Book appointment | Patient |
| GET | `/admin/dashboard` | Admin dashboard | Admin |
| GET | `/api/doctors/search` | Search doctors API | No |
| GET | `/api/doctors/:id/available-slots/:date` | Get available slots | No |

## Database Collections

- **doctors** - Doctor information and availability
- **patients** - Patient profiles and authentication
- **appointments** - Appointment bookings and status
- **admins** - Admin users and permissions

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/doctor_appointment
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
```

### MongoDB Connection

The application connects to MongoDB locally by default. To use a different database:

1. Update the connection string in `app.js`
2. Or set the `MONGODB_URI` environment variable

## Features in Detail

### Patient System
- Secure registration and login
- Profile management
- Doctor search and filtering
- Appointment booking with real-time availability
- Appointment history and management

### Admin System
- Comprehensive dashboard with statistics
- Doctor management (CRUD operations)
- Patient management and viewing
- Appointment oversight and status updates
- Developer tools and system information

### Search Functionality
- Global search in navigation bar
- Filter by department, specialization
- Real-time search suggestions
- Advanced filtering options

## Customization

### Adding New Specializations

1. Update the specialization options in `views/admin/add-doctor.ejs`
2. Add corresponding departments if needed
3. Update search filters accordingly

### Modifying Time Slots

1. Edit the time slot generation logic in `routes/api.js`
2. Update the available slots in doctor model
3. Modify the booking interface as needed

### UI Customization

1. Modify styles in `public/css/style.css`
2. Update Bootstrap theme variables
3. Customize EJS templates in `views/` directory

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Input validation and sanitization
- XSS protection
- CSRF protection (can be added)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@healthcareplus.com
- Create an issue in the repository
- Check the documentation

## Changelog

### v1.0.0
- Initial release
- Patient registration and login
- Doctor management system
- Appointment booking functionality
- Admin dashboard
- Search and filtering
- Responsive design
