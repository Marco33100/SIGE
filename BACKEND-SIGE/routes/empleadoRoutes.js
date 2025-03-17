const express = require('express');
const Empleado = require('../models/Empleado');
const jwt = require('jsonwebtoken');

const router = express.Router();


// CU01: Inicio de sesión
router.post('/login', async (req, res) => {
    try {
        // Obtener credenciales del cuerpo de la solicitud
        const { claveEmpleado, contraseña } = req.body;
        
        // Validar que se proporcionaron los campos requeridos
        if (!claveEmpleado || !contraseña) {
            return res.status(400).json({ 
                exito: false,
                msg: 'Se requiere clave de empleado y contraseña' 
            });
        }
        
        // Buscar el empleado en la base de datos
        const empleado = await Empleado.findOne({ claveEmpleado });
        
        // Verificar si el empleado existe
        if (!empleado) {
            return res.status(401).json({ 
                exito: false,
                msg: 'Empleado no existe' 
            });
        }
        
        // Verificar la contraseña
        // Nota: En una aplicación real, deberías usar bcrypt para comparar contraseñas hasheadas
        if (contraseña !== empleado.contraseña) {
            return res.status(401).json({ 
                exito: false,
                msg: 'Contraseña incorrecta' 
            });
        }
        
        // Credenciales válidas - Generar un token JWT
        const token = jwt.sign(
            { claveEmpleado: empleado.claveEmpleado }, // Payload
            '1294748329274929MA2827739028', // Clave secreta (debe ser segura y almacenada en variables de entorno)
            { expiresIn: '1h' } // Tiempo de expiración del token
        );
        
        // Devolver el token y la información del empleado
        res.status(200).json({
            exito: true,
            msg: 'Login exitoso',
            token, // Enviar el token al frontend
            empleado: {
                claveEmpleado: empleado.claveEmpleado,
                nombreEmpleado: empleado.nombreEmpleado,
                apellidoP: empleado.apellidoP,
                apellidoM: empleado.apellidoM,
                rol: empleado.rol
            }
        });
        
    } catch (error) {
        console.error('Error en el proceso de login:', error);
        res.status(500).json({ 
            exito: false,
            msg: 'Error interno del servidor',
            error: error.message 
        });
    }
});

// CU02: Registrar un nuevo empleado
router.post('/empleados', async (req, res) => {
    try {
        // Validar campos obligatorios según el esquema
        const camposObligatorios = [
            'claveEmpleado', 'nombreEmpleado', 'apellidoP', 'contraseña',
            'fechaNacimiento', 'sexo', 'departamento', 'puesto', 'rol'
        ];
        
        const camposFaltantes = camposObligatorios.filter(campo => !req.body[campo]);
        
        if (camposFaltantes.length > 0) {
            return res.status(400).json({
                exito: false,
                mensaje: `Campos obligatorios faltantes: ${camposFaltantes.join(', ')}`
            });
        }
        
        // Validar campos de domicilio
        if (!req.body.domicilio) {
            return res.status(400).json({
                exito: false,
                mensaje: 'El domicilio es obligatorio'
            });
        }
        
        const camposDomicilioObligatorios = ['calle', 'colonia', 'codigoPostal', 'ciudad'];
        const camposDomicilioFaltantes = camposDomicilioObligatorios.filter(
            campo => !req.body.domicilio[campo]
        );
        
        if (camposDomicilioFaltantes.length > 0) {
            return res.status(400).json({
                exito: false,
                mensaje: `Campos de domicilio faltantes: ${camposDomicilioFaltantes.join(', ')}`
            });
        }
        
        // Verificar si la clave de empleado ya existe
        const empleadoExistente = await Empleado.findOne({ 
            claveEmpleado: req.body.claveEmpleado 
        });
        
        if (empleadoExistente) {
            return res.status(409).json({
                exito: false,
                mensaje: `La clave de empleado "${req.body.claveEmpleado}" ya está en uso`
            });
        }
        
        // Preparar objeto completo de empleado
        const empleadoData = {
            claveEmpleado: req.body.claveEmpleado,
            nombreEmpleado: req.body.nombreEmpleado,
            apellidoP: req.body.apellidoP,
            apellidoM: req.body.apellidoM || '',
            contraseña: req.body.contraseña,
            // fechaAlta se generará automáticamente con Date.now() por el esquema
            rfc: req.body.rfc || '',
            fechaNacimiento: req.body.fechaNacimiento,
            sexo: req.body.sexo,
            fotoEmpleado: req.body.fotoEmpleado || '',
            domicilio: {
                calle: req.body.domicilio.calle,
                numInterior: req.body.domicilio.numInterior || '',
                numExterior: req.body.domicilio.numExterior || '',
                colonia: req.body.domicilio.colonia,
                codigoPostal: req.body.domicilio.codigoPostal,
                ciudad: req.body.domicilio.ciudad
            },
            departamento: req.body.departamento,
            puesto: req.body.puesto,
            telefono: req.body.telefono || [],
            correoElectronico: req.body.correoElectronico || [],
            referenciasFamiliares: req.body.referenciasFamiliares || [],
            rol: req.body.rol,
            activo: req.body.hasOwnProperty('activo') ? req.body.activo : true
        };
        
        // Validar formato de referencias familiares si existen
        if (empleadoData.referenciasFamiliares && empleadoData.referenciasFamiliares.length > 0) {
            for (let i = 0; i < empleadoData.referenciasFamiliares.length; i++) {
                const referencia = empleadoData.referenciasFamiliares[i];
                
                if (!referencia.nomCompleto || !referencia.parentesco) {
                    return res.status(400).json({
                        exito: false,
                        mensaje: `Referencia familiar #${i+1} incompleta: se requiere nombre completo y parentesco`
                    });
                }
                
                // Asegurar que los arrays existan
                if (!referencia.telefono) referencia.telefono = [];
                if (!referencia.correo) referencia.correo = [];
            }
        }
        
        // Crear nuevo empleado
        const nuevoEmpleado = new Empleado(empleadoData);
        await nuevoEmpleado.save();
        
        // Enviar respuesta exitosa
        res.status(201).json({
            exito: true,
            mensaje: 'Empleado registrado correctamente',
            empleado: {
                claveEmpleado: nuevoEmpleado.claveEmpleado,
                nombreCompleto: `${nuevoEmpleado.nombreEmpleado} ${nuevoEmpleado.apellidoP} ${nuevoEmpleado.apellidoM || ''}`,
                departamento: nuevoEmpleado.departamento,
                puesto: nuevoEmpleado.puesto,
                fechaAlta: nuevoEmpleado.fechaAlta,
                rol: nuevoEmpleado.rol,
                datos: nuevoEmpleado // Incluir todos los datos para verificación
            }
        });
        
    } catch (error) {
        console.error('Error al registrar empleado:', error);
        
        // Manejar errores específicos de MongoDB
        if (error.code === 11000) {
            return res.status(409).json({
                exito: false,
                mensaje: 'Error de duplicidad en un campo único'
            });
        }
        
        res.status(500).json({
            exito: false,
            mensaje: 'Error al registrar el empleado',
            error: error.message
        });
    }
});


// CU03: Buscar empleado para gestionar - autocompletado solo por clave
router.get('/empleados/buscar', async (req, res) => {
    try {
        const { termino } = req.query;
        
        // Validar que se proporcionó un término de búsqueda
        if (!termino) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Se requiere un término de búsqueda'
            });
        }
        
        // Crear expresión regular para búsqueda progresiva 
        // que coincida con el patrón desde el inicio de la clave
        const regex = new RegExp(`^${termino}`, 'i');
        
        // Buscar empleados que coincidan con el patrón solo en claveEmpleado
        const empleados = await Empleado.find({
            claveEmpleado: regex
        }).limit(10); // Limitar resultados para mejor rendimiento
        
        // Mapear resultados para devolver solo la información necesaria
        const resultados = empleados.map(emp => ({
            claveEmpleado: emp.claveEmpleado,
            nombreCompleto: `${emp.nombreEmpleado} ${emp.apellidoP} ${emp.apellidoM || ''}`,
            departamento: emp.departamento,
            puesto: emp.puesto
        }));
        
        // Devolver los resultados encontrados
        res.status(200).json({
            exito: true,
            mensaje: `Se encontraron ${resultados.length} empleados`,
            total: resultados.length,
            empleados: resultados
        });
        
    } catch (error) {
        console.error('Error en búsqueda de empleados:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al buscar empleados',
            error: error.message
        });
    }
});

// Ruta para obtener los detalles completos de un empleado específico
router.get('/empleados/:claveEmpleado', async (req, res) => {
    try {
        const { claveEmpleado } = req.params;
        
        // Validar que se proporcionó una clave de empleado
        if (!claveEmpleado) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Se requiere la clave de empleado'
            });
        }
        
        // Buscar el empleado por su clave exacta
        const empleado = await Empleado.findOne({ claveEmpleado });
        
        // Verificar si se encontró el empleado
        if (!empleado) {
            return res.status(404).json({
                exito: false,
                mensaje: `No se encontró ningún empleado con la clave: ${claveEmpleado}`
            });
        }
        
        // Devolver la información completa del empleado
        res.status(200).json({
            exito: true,
            mensaje: 'Empleado encontrado',
            empleado: {
                claveEmpleado: empleado.claveEmpleado,
                nombreEmpleado: empleado.nombreEmpleado,
                apellidoP: empleado.apellidoP,
                apellidoM: empleado.apellidoM,
                fechaAlta: empleado.fechaAlta,
                rfc: empleado.rfc,
                fechaNacimiento: empleado.fechaNacimiento,
                sexo: empleado.sexo,
                fotoEmpleado: empleado.fotoEmpleado,
                domicilio: empleado.domicilio,
                departamento: empleado.departamento,
                puesto: empleado.puesto,
                telefono: empleado.telefono,
                correoElectronico: empleado.correoElectronico,
                referenciasFamiliares: empleado.referenciasFamiliares,
                rol: empleado.rol,
                activo: empleado.activo
            }
        });
        
    } catch (error) {
        console.error('Error al buscar empleado:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al buscar el empleado',
            error: error.message
        });
    }
});

// CU04: Listar empleados con datos importantes
router.get('/empleados/listar', async (req, res) => {
    try {
        // Opcionalmente se pueden agregar parámetros de paginación
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        // Buscar empleados con paginación
        const empleados = await Empleado.find()
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ claveEmpleado: 1 }); // Ordenar por clave de empleado
        
        // Contar total de empleados para paginación
        const total = await Empleado.countDocuments();
        
        // Mapear solo los datos importantes para la lista
        const listaEmpleados = empleados.map(emp => ({
            claveEmpleado: emp.claveEmpleado,
            nombreCompleto: `${emp.nombreEmpleado} ${emp.apellidoP} ${emp.apellidoM || ''}`,
            departamento: emp.departamento,
            puesto: emp.puesto,
            fechaAlta: emp.fechaAlta,
            correoElectronico: emp.correoElectronico[0] || '',
            telefono: emp.telefono[0] || '',
            rol: emp.rol,
            activo: emp.activo
        }));
        
        // Devolver resultados
        res.status(200).json({
            exito: true,
            mensaje: 'Lista de empleados obtenida con éxito',
            total,
            pagina: parseInt(page),
            totalPaginas: Math.ceil(total / limit),
            empleados: listaEmpleados
        });
        
    } catch (error) {
        console.error('Error al listar empleados:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener la lista de empleados',
            error: error.message
        });
    }
});

// CU10: Editar datos del empleado
router.put('/empleados/:claveEmpleado', async (req, res) => {
    try {
        const { claveEmpleado } = req.params;
        const datosActualizados = req.body;
        
        // Validar que se proporcionó una clave de empleado
        if (!claveEmpleado) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Se requiere la clave de empleado'
            });
        }
        
        // Verificar si el empleado existe
        const empleadoExistente = await Empleado.findOne({ claveEmpleado });
        if (!empleadoExistente) {
            return res.status(404).json({
                exito: false,
                mensaje: `No se encontró empleado con la clave: ${claveEmpleado}`
            });
        }
        
        // Actualizar los datos del empleado
        // Nota: { new: true } hace que devuelva el documento actualizado
        const empleadoActualizado = await Empleado.findOneAndUpdate(
            { claveEmpleado },
            datosActualizados,
            { new: true, runValidators: true }
        );
        
        // Responder con los datos actualizados
        res.status(200).json({
            exito: true,
            mensaje: 'Datos del empleado actualizados con éxito',
            empleado: empleadoActualizado
        });
        
    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al actualizar los datos del empleado',
            error: error.message
        });
    }
});

// CU11: Consultar información personal del empleado
router.get('/empleados/personal/:claveEmpleado', async (req, res) => {
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

// CU12: Eliminar empleados
router.delete('/empleados/:claveEmpleado', async (req, res) => {
    try {
        const { claveEmpleado } = req.params;
        
        // Validar que se proporcionó una clave de empleado
        if (!claveEmpleado) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Se requiere la clave de empleado'
            });
        }
        
        // Verificar si el empleado existe
        const empleadoExistente = await Empleado.findOne({ claveEmpleado });
        if (!empleadoExistente) {
            return res.status(404).json({
                exito: false,
                mensaje: `No se encontró empleado con la clave: ${claveEmpleado}`
            });
        }
        
        // Opción 1: Eliminación física (permanente)
        // const resultado = await Empleado.findOneAndDelete({ claveEmpleado });
        
        // Opción 2: Eliminación lógica (recomendada) - Mantiene el registro pero lo marca como inactivo
        const resultado = await Empleado.findOneAndUpdate(
            { claveEmpleado },
            { activo: false },
            { new: true }
        );
        
        // Responder con éxito
        res.status(200).json({
            exito: true,
            mensaje: 'Empleado eliminado con éxito',
            // Si se usó eliminación lógica, se puede devolver el estado actualizado
            empleado: resultado
        });
        
    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al eliminar el empleado',
            error: error.message
        });
    }
});

module.exports = router;