// models/Departamento.js
const mongoose = require('mongoose');

const departamentoSchema = new mongoose.Schema({
  nomDepartamento: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
});

module.exports = mongoose.model('Departamento', departamentoSchema);
