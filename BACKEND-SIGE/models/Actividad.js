const mongoose = require('mongoose');

const ActividadSchema = new mongoose.Schema({
    nomActividad: {type: String}
});

module.exports = mongoose.model('Actividad', ActividadSchema);