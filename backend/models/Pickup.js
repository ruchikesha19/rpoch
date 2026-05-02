const mongoose = require('mongoose');

const PickupSchema = new mongoose.Schema({
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant_name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    default: 12.9716
  },
  lng: {
    type: Number,
    default: 77.5946
  },
  food_type: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  distance_km: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'accepted', 'completed'],
    default: 'available'
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  otp: {
    type: String,
    default: null
  },
  delivery_photo: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pickup', PickupSchema);
