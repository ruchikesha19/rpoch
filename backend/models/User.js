const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  user_type: {
    type: String,
    enum: ['volunteer', 'restaurant'],
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    default: ''
  },
  lat: {
    type: Number,
    default: 12.9716
  },
  lng: {
    type: Number,
    default: 77.5946
  }
}, {
  timestamps: true,
  // Add virtual field for user_id to match frontend expectations if needed
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Map _id to user_id in the JSON output
UserSchema.virtual('user_id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('User', UserSchema);
