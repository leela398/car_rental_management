const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  admin_id: { type: String, required: true, unique: true },
  admin_password: { type: String, required: true }
});

module.exports = mongoose.model('Admin', AdminSchema);
