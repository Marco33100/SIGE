const mongoose = require('mongoose');

const CursoEmpleadoSchema = new mongoose.Schema({
    claveEmpleado:String,
    nomCurso:String,
    fechaInicio: {type: Date, default: Date.now},
    fechaTermino: {type: Date},
    tipoDocumento:String,
    descripcionCurso:String,
    especialidad:String

})

module.exports = mongoose.model('CursoEmpleado', CursoEmpleadoSchema);