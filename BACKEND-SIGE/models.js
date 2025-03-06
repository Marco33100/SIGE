const mongoose = require('mongoose');

// Modelo de Empleado
const EmpleadoSchema = new mongoose.Schema({
    claveEmpleado: { type: String, unique: true, required: true },
    nombreEmpleado: { type: String, required: true },
    apellidoP: { type: String, required: true },
    apellidoM: { type: String, required: true },
    contraseña: { type: String, required: true },
    fechaAlta: { type: Date, default: Date.now },
    rfc: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    sexo: { type: String, required: true },
    fotoEmpleado: String,
    domicilio: {
        calle: { type: String, required: true },
        numInterior: String,
        numExterior: { type: String, required: true },
        colonia: { type: String, required: true },
        codigoPostal: { type: Number, required: true },
        ciudad: { type: String, required: true }
    },
    departamento: { type: String, required: true },
    puesto: { type: String, required: true },
    telefono: [{ type: String, required: true }],
    correoElectronico: [{ type: String, required: true }],
    referenciasFamiliares: [{
        nomCompleto: { type: String, required: true },
        parentesco: { type: String, required: true },
        telefono: [{ type: String, required: true }],
        correo: [{ type: String, required: true }]
    }],
    rol: { type: Number, required: true }
});

// Modelos adicionales (simplificados para el ejemplo)
const SexoSchema = new mongoose.Schema({ sexo: String });
const ParentescoSchema = new mongoose.Schema({ parentesco: String });
const CursosEmpleadoSchema = new mongoose.Schema({
    claveEmpleado: String,
    nomCurso: String,
    fechaInicio: Date,
    fechaTermino: Date,
    tipoDocumento: String,
    descripcionCurso: String,
    especialidad: String
});
const ActividadesEmpleadoSchema = new mongoose.Schema({
    claveEmpleado: String,
    nomActividad: String,
    descripcionAct: String,
    estatusActividad: Number
});
const CiudadSchema = new mongoose.Schema({ nomCiudad: String });
const DepartamentoSchema = new mongoose.Schema({ nomDepartamento: String });
const PuestoSchema = new mongoose.Schema({ nomPuesto: String });
const CursoSchema = new mongoose.Schema({ nomCurso: String });
const EspecialidadSchema = new mongoose.Schema({ nomEspecialidad: String });
const ActividadSchema = new mongoose.Schema({ nomActividad: String });
const DocumentoSchema = new mongoose.Schema({ nomDocumento: String });
const EstatusSchema = new mongoose.Schema({ estatus: Number });
const RolSchema = new mongoose.Schema({ rol: Number });

// Exportar modelos
module.exports = {
    Empleado: mongoose.model('empleado', EmpleadoSchema),
    Sexo: mongoose.model('sexo', SexoSchema),
    Parentesco: mongoose.model('parentesco', ParentescoSchema),
    CursosEmpleado: mongoose.model('cursosEmpleado', CursosEmpleadoSchema),
    ActividadesEmpleado: mongoose.model('actividadesEmpleado', ActividadesEmpleadoSchema),
    Ciudad: mongoose.model('ciudad', CiudadSchema),
    Departamento: mongoose.model('departamento', DepartamentoSchema),
    Puesto: mongoose.model('puesto', PuestoSchema),
    Curso: mongoose.model('curso', CursoSchema),
    Especialidad: mongoose.model('especialidad', EspecialidadSchema),
    Actividad: mongoose.model('actividad', ActividadSchema),
    Documento: mongoose.model('documento', DocumentoSchema),
    Estatus: mongoose.model('estatus', EstatusSchema),
    Rol: mongoose.model('rol', RolSchema)
};