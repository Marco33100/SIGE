// models/Rol.js
const mongoose = require('mongoose');

const rolSchema = new mongoose.Schema({
  rol: {
    type: Number,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('Rol', rolSchema);

