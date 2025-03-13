const mongoose = require('mongoose');

const ActividadesEmpleadoSchema = new mongoose.Schema({
    claveEmpleado: String ,
    nomActividad: String ,
    descripcionAct: String,
    estatusActividad: { type: Number, default: 0 }
});

module.exports = mongoose.model('ActividadesEmpleado', ActividadesEmpleadoSchema);