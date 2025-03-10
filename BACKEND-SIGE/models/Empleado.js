const mongoose = require('mongoose');

const EmpleadoSchema = new mongoose.Schema({
    claveEmpleado: String,
    nombreEmpleado: String,
    apellidoP: String,
    apellidoM: String,
    contraseña: String,
    fechaAlta: { type: Date, default: Date.now },
    rfc: String,
    fechaNacimiento: Date,
    sexo: String,
    fotoEmpleado: String,
    domicilio: {
        calle: String,
        numInterior: String,
        numExterior: String,
        colonia: String,
        codigoPostal: Number,
        ciudad: String
    },
    departamento: String,
    puesto: String,
    telefono: [String],
    correoElectronico: [String],
    referenciasFamiliares: [{
        nomCompleto: String,
        parentesco: String,
        telefono: [String],
        correo: [String]
    }],
    rol: Number
});

module.exports = mongoose.model('Empleado', EmpleadoSchema);
