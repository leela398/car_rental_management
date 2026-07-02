const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  card_no: { type: String, required: true },
  exp_date: { type: String, required: true },
  cvv: { type: Number, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model('Payment', PaymentSchema);
