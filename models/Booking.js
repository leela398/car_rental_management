const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  car_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  email: { type: String, required: true },
  book_place: { type: String, required: true },
  book_date: { type: Date, required: true },
  duration: { type: Number, required: true },
  phone_number: { type: Number, required: true },
  destination: { type: String, required: true },
  price: { type: Number, required: true },
  return_date: { type: Date, required: true },
  book_status: { type: String, default: 'PENDING' }
});

module.exports = mongoose.model('Booking', BookingSchema);
