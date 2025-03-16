// models/Puesto.js
const mongoose = require('mongoose');

const puestoSchema = new mongoose.Schema({
  nomPuesto: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
});

module.exports = mongoose.model('Puesto', puestoSchema);
