const mongoose = require('mongoose');

const EspecialidadSchema = new mongoose.Schema({
    nomEspecialidad: String
});

module.exports = mongoose.model('Especialidad', EspecialidadSchema);    