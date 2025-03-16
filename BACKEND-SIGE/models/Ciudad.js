// models/Ciudad.js
const mongoose = require('mongoose');

const ciudadSchema = new mongoose.Schema({
  nomCiudad: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
});

module.exports = mongoose.model('Ciudad', ciudadSchema);