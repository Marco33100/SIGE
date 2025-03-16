// models/Sexo.js
const mongoose = require('mongoose');

const sexoSchema = new mongoose.Schema({
  sexo: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
});

module.exports = mongoose.model('Sexo', sexoSchema);
