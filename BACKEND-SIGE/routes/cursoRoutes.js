const express = require('express');

const CursoEmpleado = require('../models/CursoEmpleado');
const Curso = require('../models/Curso');
const Documento = require('../models/Documento');
const Especialidad = require('../models/Especialidad');
const Empleado = require('../models/Empleado');
const ActividadEmpleado = require('../models/ActividadesEmpleado');
const { autenticarEmpleado } = require('../middleware/authMiddleware');



const router = express.Router();


// CU05: Agregar cursos a empleado
router.post('/agregarCursoEmpleado', async (req, res) => {
    try {
        const { claveEmpleado, nomCurso, fechaInicio, fechaTermino, tipoDocumento, descripcionCurso, especialidad } = req.body;

        // Verificar que el empleado exista
        const empleadoExiste = await Empleado.findOne({ claveEmpleado });
        if (!empleadoExiste) {
            return res.status(404).json({ msg: 'El empleado no existe' });
        }

        // Verificar que el curso exista en el catálogo
        const cursoExiste = await Curso.findOne({ nomCurso });
        if (!cursoExiste) {
            return res.status(404).json({ msg: 'El curso no existe en el catálogo' });
        }

        // Verificar que el tipo de documento exista
        if (tipoDocumento) {
            const documentoExiste = await Documento.findOne({ nomDocumento: tipoDocumento });
            if (!documentoExiste) {
                return res.status(404).json({ msg: 'El tipo de documento no existe en el catálogo' });
            }
        }

        // Verificar que la especialidad exista
        if (especialidad) {
            const especialidadExiste = await Especialidad.findOne({ nomEspecialidad: especialidad });
            if (!especialidadExiste) {
                return res.status(404).json({ msg: 'La especialidad no existe en el catálogo' });
            }
        }

        const nuevoCursoEmpleado = new CursoEmpleado({
            claveEmpleado,
            nomCurso,
            fechaInicio: fechaInicio || Date.now(),
            fechaTermino,
            tipoDocumento,
            descripcionCurso,
            especialidad
        });

        await nuevoCursoEmpleado.save();

        res.json({
            msg: 'Curso asignado al empleado con éxito',
            curso: nuevoCursoEmpleado,
            empleado: { claveEmpleado }
        });

    } catch (error) {
        console.error('Error al agregar curso al empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CU05: Agregar cursos a empleado (solo para el empleado autenticado)
router.post('/agregarCursoPEmpleado', autenticarEmpleado, async (req, res) => {
    try {
        // Obtener la clave del empleado autenticado desde el token
        const claveEmpleado = req.claveEmpleado;

        const { nomCurso, fechaInicio, fechaTermino, tipoDocumento, descripcionCurso, especialidad } = req.body;

        const empleadoExiste = await Empleado.findOne({ claveEmpleado });
        if (!empleadoExiste) {
            return res.status(404).json({
                exito: false,
                msg: 'El empleado no existe'
            });
        }

        if (tipoDocumento) {
            const documentoExiste = await Documento.findOne({ nomDocumento: tipoDocumento });
            if (!documentoExiste) {
                return res.status(404).json({
                    exito: false,
                    msg: 'El tipo de documento no existe en el catálogo'
                });
            }
        }

        if (especialidad) {
            const especialidadExiste = await Especialidad.findOne({ nomEspecialidad: especialidad });
            if (!especialidadExiste) {
                return res.status(404).json({
                    exito: false,
                    msg: 'La especialidad no existe en el catálogo'
                });
            }
        }

        // Crear el nuevo curso para el empleado
        const nuevoCursoEmpleado = new CursoEmpleado({
            claveEmpleado, 
            nomCurso, 
            fechaInicio: fechaInicio || Date.now(), 
            fechaTermino, 
            tipoDocumento, 
            descripcionCurso, 
            especialidad 
        });

        await nuevoCursoEmpleado.save();

        res.status(201).json({
            exito: true,
            msg: 'Curso asignado al empleado con éxito',
            curso: nuevoCursoEmpleado,
            empleado: { claveEmpleado }
        });

    } catch (error) {
        console.error('Error al agregar curso al empleado:', error);
        res.status(500).json({
            exito: false,
            msg: 'Error interno del servidor',
            error: error.message
        });
    }
});

// CUI10: Mostrar especialidades
router.get('/especialidades', async (req, res) => {
    try {
        const especialidades = await Especialidad.find().select('nomEspecialidad');
        res.json(especialidades);
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CUI11: Mostrar tipos de documentos
router.get('/documentos', async (req, res) => {
    try {
        const documentos = await Documento.find().select('nomDocumento');
        res.json(documentos);
    } catch (error) {
        console.error('Error al obtener tipos de documentos:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

router.get('/buscarE/:claveEmpleado', async (req, res) => {
    try {
        const { claveEmpleado } = req.params;

        const empleado = await Empleado.findOne({ claveEmpleado });

        if (!empleado) {
            return res.status(404).json({ msg: 'Empleado no encontrado' });
        }

        res.json(empleado);
    } catch (error) {
        console.error('Error al buscar empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CUI14: Mostrar opciones "Actividades" o "Cursos"
router.get('/opciones', async (req, res) => {
    try {
        const opciones = [
            { id: 'actividades', nombre: 'Actividades' },
            { id: 'cursos', nombre: 'Cursos' }
        ];

        res.json(opciones);
    } catch (error) {
        console.error('Error al obtener opciones:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CUE12: Visualizar cursos del empleado
router.get('/visualizarCursosEmpleado/:claveEmpleado', async (req, res) => {
    try {
        const { claveEmpleado } = req.params;

        // Verificar que el empleado exista
        const empleadoExiste = await Empleado.findOne({ claveEmpleado });
        if (!empleadoExiste) {
            return res.status(404).json({ msg: 'El empleado no existe' });
        }

        const cursos = await CursoEmpleado.find({ claveEmpleado });

        res.json(cursos);
    } catch (error) {
        console.error('Error al visualizar cursos del empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CUE13: Visualizar actividades del empleado
router.get('/visualizarActividadesEmpleado/:claveEmpleado', async (req, res) => {
    try {
        const { claveEmpleado } = req.params;

        const empleadoExiste = await Empleado.findOne({ claveEmpleado });
        if (!empleadoExiste) {
            return res.status(404).json({ msg: 'El empleado no existe' });
        }
        const actividades = await ActividadEmpleado.find({ claveEmpleado });

        res.json(actividades);
    } catch (error) {
        console.error('Error al visualizar actividades del empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CUE14: Editar cursos del empleado
router.put('/editarCursoEmpleado/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fechaInicio,
            fechaTermino,
            tipoDocumento,
            descripcionCurso,
            especialidad
        } = req.body;

        // Verificar que el tipo de documento exista
        if (tipoDocumento) {
            const documentoExiste = await Documento.findOne({ nomDocumento: tipoDocumento });
            if (!documentoExiste) {
                return res.status(404).json({ msg: 'El tipo de documento no existe en el catálogo' });
            }
        }
        // Verificar que la especialidad exista
        if (especialidad) {
            const especialidadExiste = await Especialidad.findOne({ nomEspecialidad: especialidad });
            if (!especialidadExiste) {
                return res.status(404).json({ msg: 'La especialidad no existe en el catálogo' });
            }
        }
        const cursoActualizado = await CursoEmpleado.findByIdAndUpdate(
            id,
            {
                fechaInicio,
                fechaTermino,
                tipoDocumento,
                descripcionCurso,
                especialidad
            },
            { new: true }
        );
        if (!cursoActualizado) {
            return res.status(404).json({ msg: 'Curso no encontrado' });
        }

        res.json({
            msg: 'Curso actualizado con éxito',
            curso: cursoActualizado
        });
    } catch (error) {
        console.error('Error al editar curso del empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CUE15: Editar actividades del empleado
router.put('/editarActividadEmpleado/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcionAct, estatusActividad } = req.body;

        // Verificar que el estatus es válido (0 o 1)
        if (estatusActividad !== undefined) {
            const estatusNum = Number(estatusActividad);
            const estatusValido = [0, 1].includes(estatusNum);

            if (!estatusValido) {
                return res.status(400).json({
                    msg: 'El estatus especificado no es válido',
                    estatusIngresado: estatusNum,
                    estatusPermitidos: [0, 1]
                });
            }
        }

        const actividadActualizada = await ActividadEmpleado.findByIdAndUpdate(
            id,
            { descripcionAct, estatusActividad },
            { new: true }
        );

        if (!actividadActualizada) {
            return res.status(404).json({ msg: 'Actividad no encontrada' });
        }

        res.json({
            msg: 'Actividad actualizada con éxito',
            actividad: actividadActualizada
        });
    } catch (error) {
        console.error('Error al editar actividad del empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CUE16: Eliminar cursos del empleado
router.delete('/eliminarCursoEmpleado/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const cursoEliminado = await CursoEmpleado.findByIdAndDelete(id);

        if (!cursoEliminado) {
            return res.status(404).json({ msg: 'Curso no encontrado' });
        }

        res.json({
            msg: 'Curso eliminado con éxito',
            curso: cursoEliminado
        });
    } catch (error) {
        console.error('Error al eliminar curso del empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CUE17: Eliminar actividades del empleado
router.delete('/eliminarActividadEmpleado/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const actividadEliminada = await ActividadEmpleado.findByIdAndDelete(id);

        if (!actividadEliminada) {
            return res.status(404).json({ msg: 'Actividad no encontrada' });
        }

        res.json({
            msg: 'Actividad eliminada con éxito',
            actividad: actividadEliminada
        });
    } catch (error) {
        console.error('Error al eliminar actividad del empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

router.get('/visualizarCursos', async (req, res) => {
    try {
        const {
            fechaInicio,
            fechaTermino,
            tipoDocumento,
            especialidad,
            claveEmpleado,
            page = 1, // Página actual (por defecto 1)
            pageSize = 10 // Tamaño de la página (por defecto 10)
        } = req.query;

        // Construir el filtro
        const filtro = {};

        if (fechaInicio) {
            filtro.fechaInicio = { $gte: new Date(fechaInicio) };
        }

        if (fechaTermino) {
            filtro.fechaTermino = { $lte: new Date(fechaTermino) };
        }

        if (tipoDocumento) {
            filtro.tipoDocumento = tipoDocumento;
        }

        if (especialidad) {
            filtro.especialidad = especialidad;
        }

        if (claveEmpleado) {
            filtro.claveEmpleado = claveEmpleado;
        }

        // Calcular el índice de inicio
        const startIndex = (page - 1) * pageSize;

        // Obtener los cursos paginados
        const cursos = await CursoEmpleado.find(filtro)
            .skip(startIndex) // Saltar los registros anteriores
            .limit(Number(pageSize)); // Limitar la cantidad de registros por página

        // Obtener el total de cursos (para calcular el total de páginas)
        const totalCursos = await CursoEmpleado.countDocuments(filtro);

        res.json({
            total: totalCursos, // Total de cursos (para la paginación en el frontend)
            cursos
        });
    } catch (error) {
        console.error('Error al visualizar cursos:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CU08: Visualizar cursos con filtros (solo para el empleado autenticado)
router.get('/visualizarCursosE', autenticarEmpleado, async (req, res) => {
    try {
        const { fechaInicio, fechaTermino, tipoDocumento, especialidad } = req.query;
        const claveEmpleado = req.claveEmpleado; // Obtener la clave del empleado autenticado

        // Construir el filtro
        const filtro = { claveEmpleado };

        if (fechaInicio) {
            filtro.fechaInicio = { $gte: new Date(fechaInicio) };
        }

        if (fechaTermino) {
            filtro.fechaTermino = { $lte: new Date(fechaTermino) };
        }

        if (tipoDocumento) {
            filtro.tipoDocumento = tipoDocumento;
        }

        if (especialidad) {
            filtro.especialidad = especialidad;
        }

        // Buscar cursos con el filtro
        const cursos = await CursoEmpleado.find(filtro);

        res.json({
            total: cursos.length,
            cursos
        });
    } catch (error) {
        console.error('Error al visualizar cursos:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});


// Obtener lista de cursos disponibles
router.get('/cursos', async (req, res) => {
    try {
        const cursos = await Curso.find().select('nomCurso');
        res.json(cursos);
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});


// endpoint para traer la informacion del empleado
router.get('/personal/:claveEmpleado', async (req, res) => {
    try {
        const { claveEmpleado } = req.params;

        // Validar que se proporcionó una clave de empleado
        if (!claveEmpleado) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Se requiere la clave de empleado'
            });
        }

        // Buscar empleado por clave
        const empleado = await Empleado.findOne({ claveEmpleado });

        // Verificar si se encontró
        if (!empleado) {
            return res.status(404).json({
                exito: false,
                mensaje: `No se encontró empleado con la clave: ${claveEmpleado}`
            });
        }

        // Devolver solo la información personal del empleado
        res.status(200).json({
            exito: true,
            mensaje: 'Información personal del empleado obtenida con éxito',
            datosPersonales: {
                claveEmpleado: empleado.claveEmpleado,
                nombreEmpleado: empleado.nombreEmpleado,
                apellidoP: empleado.apellidoP,
                apellidoM: empleado.apellidoM,
                fechaNacimiento: empleado.fechaNacimiento,
                rfc: empleado.rfc,
                sexo: empleado.sexo,
                fotoEmpleado: empleado.fotoEmpleado,
                domicilio: empleado.domicilio,
                telefono: empleado.telefono,
                correoElectronico: empleado.correoElectronico,
                referenciasFamiliares: empleado.referenciasFamiliares
            }
        });

    } catch (error) {
        console.error('Error al consultar información personal:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener la información personal del empleado',
            error: error.message
        });
    }
});



module.exports = router;
