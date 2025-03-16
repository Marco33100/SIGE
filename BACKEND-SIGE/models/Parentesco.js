// models/Parentesco.js
const mongoose = require('mongoose');

const parentescoSchema = new mongoose.Schema({
  parentesco: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
});

module.exports = mongoose.model('Parentesco', parentescoSchema);
