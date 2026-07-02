const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const Feedback = require('./models/Feedback');
const Admin = require('./models/Admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carproject';
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully!');
    // Seed default admin if not present
    const adminExists = await Admin.findOne({ admin_id: 'admin' });
    if (!adminExists) {
      await Admin.create({
        admin_id: 'admin',
        admin_password: 'admin' // Simple plain text to match original PHP
      });
      console.log('Default admin seeded (admin/admin)');
    }
    
    // Seed default premium cars if database is empty
    const carExists = await Car.findOne();
    if (!carExists) {
      await Car.create([
        { car_name: 'Ferrari F8 Tributo', fuel_type: 'Petrol', capacity: 2, price: 25000, car_img: 'ferrari.jpg', available: 'Y' },
        { car_name: 'Lamborghini Huracán Evo', fuel_type: 'Petrol', capacity: 2, price: 30000, car_img: 'lamborghini.webp', available: 'Y' },
        { car_name: 'Porsche 911 GT3', fuel_type: 'Petrol', capacity: 2, price: 20000, car_img: 'porsche.jpg', available: 'Y' },
        { car_name: 'Tesla Model S Plaid', fuel_type: 'Electric', capacity: 5, price: 15000, car_img: 'tesla_models.png', available: 'Y' }
      ]);
      console.log('Default premium cars seeded successfully!');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Set up Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'carrental-default-secret-key-9999',
  resave: false,
  saveUninitialized: true
}));

// Multer Storage Configuration for Car Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/images'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = 'IMG-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpg, jpeg, png, webp, svg) are allowed'));
    }
  }
});

// Middleware to protect routes
const requireLogin = (req, res, next) => {
  if (!req.session.email) {
    return res.redirect('/');
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.redirect('/adminlogin');
  }
  next();
};

// ================= USER ROUTES =================

// Landing Page / Login
app.get('/', (req, res) => {
  if (req.session.email) {
    return res.redirect('/cardetails');
  }
  res.render('index', { error: null });
});

app.post('/login', async (req, res) => {
  const { email, pass } = req.body;
  if (!email || !pass) {
    return res.render('index', { error: 'Please fill in all blanks' });
  }

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      const isMatch = await user.comparePassword(pass);
      if (isMatch) {
        req.session.email = user.email;
        return res.redirect('/cardetails');
      } else {
        return res.render('index', { error: 'Enter a proper password' });
      }
    } else {
      return res.render('index', { error: 'Enter a proper email' });
    }
  } catch (err) {
    console.error(err);
    res.render('index', { error: 'An error occurred during login' });
  }
});

// User Registration
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  const { fname, lname, email, lic, ph, pass, cpass, gender } = req.body;

  if (!fname || !lname || !email || !lic || !ph || !pass || !gender) {
    return res.render('register', { error: 'Please fill in all fields' });
  }

  if (pass !== cpass) {
    return res.render('register', { error: 'PASSWORD DID NOT MATCH' });
  }

  try {
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.render('register', { error: 'EMAIL ALREADY EXISTS!' });
    }

    const newUser = new User({
      fname,
      lname,
      email,
      lic_num: lic,
      phone_number: Number(ph),
      password: pass,
      gender
    });

    await newUser.save();
    res.send('<script>alert("Registration Successful! Click OK to login."); window.location.href = "/";</script>');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Please check connection or inputs' });
  }
});

// Car Details Catalog
app.get('/cardetails', requireLogin, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    const cars = await Car.find({ available: 'Y' });
    res.render('cardetails', { user, cars });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Booking Page
app.get('/booking/:id', requireLogin, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    const user = await User.findOne({ email: req.session.email });
    if (!car) {
      return res.status(404).send('Car not found');
    }
    res.render('booking', { car, user, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/booking/:id', requireLogin, async (req, res) => {
  const { place, date, dur, ph, des, rdate } = req.body;
  const carId = req.params.id;

  try {
    const car = await Car.findById(carId);
    const user = await User.findOne({ email: req.session.email });

    if (!place || !date || !dur || !ph || !des || !rdate) {
      return res.render('booking', { car, user, error: 'Please fill all spaces' });
    }

    const bookDateObj = new Date(date);
    const returnDateObj = new Date(rdate);

    if (bookDateObj >= returnDateObj) {
      return res.render('booking', { car, user, error: 'Please enter a correct return date' });
    }

    const totalPrice = Number(dur) * car.price;

    const newBooking = new Booking({
      car_id: car._id,
      email: user.email,
      book_place: place,
      book_date: bookDateObj,
      duration: Number(dur),
      phone_number: Number(ph),
      destination: des,
      price: totalPrice,
      return_date: returnDateObj
    });

    const savedBooking = await newBooking.save();
    req.session.bid = savedBooking._id; // Save booking ID in session for payment
    res.redirect('/payment');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Payment
app.get('/payment', requireLogin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.session.bid);
    if (!booking) {
      return res.redirect('/cardetails');
    }
    res.render('payment', { booking, error: null });
  } catch (err) {
    console.error(err);
    res.redirect('/cardetails');
  }
});

app.post('/payment', requireLogin, async (req, res) => {
  const { cardno, exp, cvv } = req.body;
  const bid = req.session.bid;

  try {
    const booking = await Booking.findById(bid);
    if (!booking) {
      return res.redirect('/cardetails');
    }

    if (!cardno || !exp || !cvv) {
      return res.render('payment', { booking, error: 'Please fill all payment fields' });
    }

    const newPayment = new Payment({
      booking_id: booking._id,
      card_no: cardno,
      exp_date: exp,
      cvv: Number(cvv),
      price: booking.price
    });

    await newPayment.save();
    res.redirect('/psucess');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Payment Success
app.get('/psucess', requireLogin, (req, res) => {
  res.render('psucess');
});

// Booking Status
app.get('/bookinstatus', requireLogin, async (req, res) => {
  try {
    const booking = await Booking.findOne({ email: req.session.email }).sort({ _id: -1 }).populate('car_id');
    const user = await User.findOne({ email: req.session.email });

    if (!booking) {
      return res.send('<script>alert("THERE ARE NO BOOKING DETAILS"); window.location.href = "/cardetails";</script>');
    }

    res.render('bookinstatus', { booking, user });
  } catch (err) {
    console.error(err);
    res.redirect('/cardetails');
  }
});

// Cancel Booking
app.get('/cancelbooking', requireLogin, (req, res) => {
  res.render('cancelbooking');
});

app.post('/cancelbooking', requireLogin, async (req, res) => {
  try {
    const bid = req.session.bid;
    if (bid) {
      await Booking.findByIdAndDelete(bid);
    }
    res.send('<script>window.location.href="/cardetails";</script>');
  } catch (err) {
    console.error(err);
    res.redirect('/cardetails');
  }
});

// Feedback Form
app.get('/feedback', requireLogin, (req, res) => {
  res.render('feedback');
});

app.post('/feedback', requireLogin, async (req, res) => {
  const { comment } = req.body;
  if (!comment) {
    return res.redirect('/feedback');
  }
  try {
    await Feedback.create({
      email: req.session.email,
      comment
    });
    res.send('<script>alert("Feedback Sent Successfully! THANK YOU!"); window.location.href = "/cardetails";</script>');
  } catch (err) {
    console.error(err);
    res.redirect('/cardetails');
  }
});

// ================= ADMIN ROUTES =================

// Admin Login
app.get('/adminlogin', (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admindash');
  }
  res.render('adminlogin', { error: null });
});

app.post('/adminlogin', async (req, res) => {
  const { adid, adpass } = req.body;
  if (!adid || !adpass) {
    return res.render('adminlogin', { error: 'Please fill in all blanks' });
  }

  try {
    const admin = await Admin.findOne({ admin_id: adid });
    if (admin && admin.admin_password === adpass) {
      req.session.isAdmin = true;
      res.send('<script>alert("Welcome ADMINISTRATOR!"); window.location.href = "/admindash";</script>');
    } else {
      res.render('adminlogin', { error: 'Enter a proper admin ID/password' });
    }
  } catch (err) {
    console.error(err);
    res.render('adminlogin', { error: 'An error occurred' });
  }
});

// Admin Dashboard - Feedback Lists
app.get('/admindash', requireAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.render('admindash', { feedbacks });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Vehicle Management
app.get('/adminvehicle', requireAdmin, async (req, res) => {
  try {
    const cars = await Car.find();
    res.render('adminvehicle', { cars });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Add Car Page
app.get('/addcar', requireAdmin, (req, res) => {
  res.render('addcar');
});

app.post('/addcar', requireAdmin, upload.single('image'), async (req, res) => {
  const { carname, ftype, capacity, price } = req.body;
  
  if (!req.file) {
    return res.send('<script>alert("Please select a car image!"); window.location.href = "/addcar";</script>');
  }

  try {
    const newCar = new Car({
      car_name: carname,
      fuel_type: ftype,
      capacity: Number(capacity),
      price: Number(price),
      car_img: req.file.filename,
      available: 'Y'
    });

    await newCar.save();
    res.send('<script>alert("New Car Added Successfully!"); window.location.href = "/adminvehicle";</script>');
  } catch (err) {
    console.error(err);
    res.send('<script>alert("An error occurred!"); window.location.href = "/addcar";</script>');
  }
});

// Delete Car
app.get('/deletecar/:id', requireAdmin, async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.send('<script>alert("CAR DELETED SUCCESSFULLY"); window.location.href = "/adminvehicle";</script>');
  } catch (err) {
    console.error(err);
    res.redirect('/adminvehicle');
  }
});

// Users List
app.get('/adminusers', requireAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.render('adminusers', { users });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete User
app.get('/deleteuser/:email', requireAdmin, async (req, res) => {
  try {
    await User.findOneAndDelete({ email: req.params.email });
    res.send('<script>alert("USER DELETED SUCCESSFULLY"); window.location.href = "/adminusers";</script>');
  } catch (err) {
    console.error(err);
    res.redirect('/adminusers');
  }
});

// Booking Requests List
app.get('/adminbook', requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ _id: -1 });
    res.render('adminbook', { bookings });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Approve Booking Request
app.get('/approvebooking/:id', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.redirect('/adminbook');
    }

    const car = await Car.findById(booking.car_id);
    if (car && car.available === 'Y') {
      booking.book_status = 'APPROVED';
      await booking.save();

      car.available = 'N';
      await car.save();

      res.send('<script>alert("APPROVED SUCCESSFULLY"); window.location.href = "/adminbook";</script>');
    } else {
      res.send('<script>alert("CAR IS NOT AVAILABLE"); window.location.href = "/adminbook";</script>');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/adminbook');
  }
});

// Return Car / Returned Booking Status
app.get('/returncar/:car_id/:book_id', requireAdmin, async (req, res) => {
  try {
    const car = await Car.findById(req.params.car_id);
    const booking = await Booking.findById(req.params.book_id);

    if (car && booking) {
      car.available = 'Y';
      await car.save();

      booking.book_status = 'RETURNED';
      await booking.save();

      res.send('<script>alert("CAR RETURNED SUCCESSFULLY"); window.location.href = "/adminbook";</script>');
    } else {
      res.redirect('/adminbook');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/adminbook');
  }
});

// About Us Route
app.get('/about', (req, res) => {
  const user = req.session.email ? { email: req.session.email } : null;
  res.render('aboutus', { user });
});

// Contact Us Route
app.get('/contact', (req, res) => {
  const user = req.session.email ? { email: req.session.email } : null;
  res.render('contactus', { user });
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
