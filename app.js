const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect('mongodb://localhost:27017/doctor_appointment', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// ✅ CRITICAL: Set view engine FIRST
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ CRITICAL: Express EJS Layouts setup
app.use(expressLayouts);
app.set('layout', 'layout'); // This should match your layout file name
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);
app.set("layout extractMetas", true);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'doctor-appointment-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  res.locals.admin = req.session.admin || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/appointments', require('./routes/appointments'));
app.use('/api', require('./routes/api'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Server Error', error: err });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});