const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  car_name: { type: String, required: true },
  fuel_type: { type: String, required: true },
  capacity: { type: Number, required: true },
  price: { type: Number, required: true },
  car_img: { type: String, required: true },
  available: { type: String, default: 'Y' }
});

module.exports = mongoose.model('Car', CarSchema);
