const mongoose = require('mongoose');

const EmpleadoSchema = new mongoose.Schema({
    claveEmpleado: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    nombreEmpleado: {
        type: String,
        required: true,
        trim: true
    },
    apellidoP: {
        type: String,
        required: true,
        trim: true
    },
    apellidoM: {
        type: String,
        trim: true
    },
    contraseña: {
        type: String,
        required: true
    },
    fechaAlta: { 
        type: Date, 
        default: Date.now 
    },
    rfc: {
        type: String,
        trim: true,
        uppercase: true
    },
    fechaNacimiento: {
        type: Date,
        required: true
    },
    sexo: {
        type: String,
        enum: ['Masculino', 'Femenino', 'Otro'],
        required: true
    },
    fotoEmpleado: {
        type: String
    },
    domicilio: {
        calle: {
            type: String,
            required: true,
            trim: true
        },
        numInterior: {
            type: String,
            trim: true
        },
        numExterior: {
            type: String,
            trim: true
        },
        colonia: {
            type: String,
            required: true,
            trim: true
        },
        codigoPostal: {
            type: Number,
            required: true
        },
        ciudad: {
            type: String,
            required: true,
            trim: true
        }
    },
    departamento: {
        type: String,
        required: true,
        trim: true
    },
    puesto: {
        type: String,
        required: true,
        trim: true
    },
    telefono: [{
        type: String,
        trim: true
    }],
    correoElectronico: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    referenciasFamiliares: [{
        nomCompleto: {
            type: String,
            required: true,
            trim: true
        },
        parentesco: {
            type: String,
            required: true,
            trim: true
        },
        telefono: [{
            type: String,
            trim: true
        }],
        correo: [{
            type: String,
            trim: true,
            lowercase: true
        }]
    }],
    rol: {
        type: Number,
        enum: [1, 2, 3], // 1: Administrador, 2: Supervisor, 3: Empleado normal
        required: true,
        default: 3
    },
    activo: {
        type: Boolean,
        default: true
    }
});

// Índices para mejorar búsquedas frecuentes
// Comente esta linea porque me marca este error we 
//(node:17532) [MONGOOSE] Warning: Duplicate schema index on {"claveEmpleado":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
//(Use `node --trace-warnings ...` to show where the warning was created)
//EmpleadoSchema.index({ claveEmpleado: 1 });
EmpleadoSchema.index({ apellidoP: 1, apellidoM: 1, nombreEmpleado: 1 });
EmpleadoSchema.index({ departamento: 1 });
EmpleadoSchema.index({ puesto: 1 });
EmpleadoSchema.index({ fechaAlta: 1 });
EmpleadoSchema.index({ rol: 1 });

module.exports = mongoose.model('Empleado', EmpleadoSchema);