const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  email: { type: String, required: true },
  comment: { type: String, required: true }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
