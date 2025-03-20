const express = require('express');
const Empleado = require('../models/Empleado');
const jwt = require('jsonwebtoken');
const { autenticarEmpleado } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');


const router = express.Router();
exports.router = router;


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

// Función para generar clave de empleado en formato RASG-001
const generarClaveEmpleado = async (nombre, apellidoP, apellidoM = '') => {
    // Obtener iniciales de cada parte del nombre y apellidos
    const iniciales = [
        ...nombre.split(' ').map(p => p[0].toUpperCase()),
        apellidoP[0].toUpperCase(),
        apellidoM?.[0]?.toUpperCase() || ''
    ].join('');

    // Buscar el último consecutivo existente
    const ultimo = await Empleado.findOne(
        { claveEmpleado: new RegExp(`^${iniciales}-\\d{3}$`) },
        { claveEmpleado: 1 },
        { sort: { claveEmpleado: -1 } }
    ).lean();

    // Calcular nuevo consecutivo
    const consecutivo = ultimo 
        ? parseInt(ultimo.claveEmpleado.split('-')[1]) + 1
        : 1;

    return `${iniciales}-${consecutivo.toString().padStart(3, '0')}`;
};

// Función para generar RFC en formato SIGR-770910
const generarRFC = (apellidoP, apellidoM = '', nombre, fechaNac) => {
    const fecha = new Date(fechaNac);
    
    // Componentes del RFC
    const componentes = {
        apellidoP: apellidoP.slice(0, 2).toUpperCase(),
        apellidoM: apellidoM?.[0]?.toUpperCase() || 'X',
        nombre: nombre[0].toUpperCase(),
        fecha: `${fecha.getFullYear().toString().slice(-2)}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}`
    };
    
    return `${componentes.apellidoP}${componentes.apellidoM}${componentes.nombre}-${componentes.fecha}`;
};

// CU02: Registrar nuevo empleado
router.post('/registrar', async (req, res) => {
    try {
        // 1. Validación de campos requeridos
        const camposRequeridos = [
            'nombreEmpleado', 'apellidoP', 'contraseña',
            'fechaNacimiento', 'sexo', 'departamento', 'puesto', 'rol'
        ];
        
        const faltantes = camposRequeridos.filter(campo => !req.body[campo]);
        if (faltantes.length > 0) {
            return res.status(400).json({
                exito: false,
                error: 'CAMPOS_FALTANTES',
                detalles: `Campos requeridos: ${faltantes.join(', ')}`
            });
        }

        // 2. Validación de domicilio
        const domicilioRequerido = ['calle', 'colonia', 'codigoPostal', 'ciudad'];
        if (!req.body.domicilio || domicilioRequerido.some(c => !req.body.domicilio[c])) {
            return res.status(400).json({
                exito: false,
                error: 'DOMICILIO_INCOMPLETO',
                detalles: domicilioRequerido.filter(c => !req.body.domicilio?.[c])
            });
        }

        // 3. Generación de claves
        const claveEmpleado = await generarClaveEmpleado(
            req.body.nombreEmpleado,
            req.body.apellidoP,
            req.body.apellidoM
        );

        const rfc = generarRFC(
            req.body.apellidoP,
            req.body.apellidoM || '',
            req.body.nombreEmpleado,
            req.body.fechaNacimiento
        );

        // 4. Validación de referencias familiares
        if (req.body.referenciasFamiliares?.length > 0) {
            const refsInvalidas = req.body.referenciasFamiliares
                .map((ref, i) => {
                    const errores = [];
                    if (!ref.nomCompleto?.trim()) errores.push('Nombre requerido');
                    if (!ref.parentesco?.trim()) errores.push('Parentesco requerido');
                    return errores.length > 0 ? `Ref ${i+1}: ${errores.join(', ')}` : null;
                })
                .filter(Boolean);

            if (refsInvalidas.length > 0) {
                return res.status(400).json({
                    exito: false,
                    error: 'REFERENCIAS_INVALIDAS',
                    detalles: refsInvalidas
                });
            }
        }


        // 6. Crear objeto empleado
        const empleadoData = {
            claveEmpleado,
            ...req.body,
            contraseña: req.body.contraseña,
            rfc: req.body.rfc || rfc,
            domicilio: {
                ...req.body.domicilio,
                codigoPostal: Number(req.body.domicilio.codigoPostal)
            },
            fechaAlta: Date.now(),
            activo: true
        };

        // 7. Guardar en base de datos
        const nuevoEmpleado = new Empleado(empleadoData);
        await nuevoEmpleado.save();

        // 8. Preparar respuesta
        res.status(201).json({
            exito: true,
            datos: {
                clave: nuevoEmpleado.claveEmpleado,
                nombre: `${nuevoEmpleado.nombreEmpleado} ${nuevoEmpleado.apellidoP}${nuevoEmpleado.apellidoM ? ' ' + nuevoEmpleado.apellidoM : ''}`,
                rfc: nuevoEmpleado.rfc,
                departamento: nuevoEmpleado.departamento,
                puesto: nuevoEmpleado.puesto,
                fechaAlta: nuevoEmpleado.fechaAlta
            }
        });

    } catch (error) {
        // Manejo de errores
        let status = 500;
        let errorCode = 'ERROR_INTERNO';
        let detalles = null;

        if (error.code === 11000) {
            status = 409;
            errorCode = 'REGISTRO_DUPLICADO';
            detalles = Object.keys(error.keyPattern)[0];
        }

        if (error.name === 'ValidationError') {
            status = 400;
            errorCode = 'VALIDACION_FALLIDA';
            detalles = Object.values(error.errors).map(e => e.message);
        }

        console.error('Error en registro:', error);
        res.status(status).json({
            exito: false,
            error: errorCode,
            detalles: process.env.NODE_ENV === 'development' ? detalles : null
        });
    }
});

// CU03: Búsqueda progresiva de empleados por clave (autocompletado)
router.get('/buscar', async (req, res) => {
    try {
        const { termino } = req.query;
        
        // Validar término de búsqueda
        if (!termino || termino.length < 1) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Debe ingresar al menos un carácter para buscar'
            });
        }
        
        // Escapar caracteres especiales en el término de búsqueda
        const terminoLimpio = termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Crear expresión regular para búsqueda progresiva
        // Aquí está el cambio - usamos el patrón directamente en $regex sin crear un objeto RegExp
        const patronBusqueda = `(?=.*${terminoLimpio.split('').join(')(?=.*')})`;
        
        // Pipeline de agregación para búsqueda progresiva
        const resultados = await Empleado.aggregate([
            {
                $match: {
                    claveEmpleado: {
                        // Corrección: usar el patrón como string y opciones separadas
                        $regex: patronBusqueda,
                        $options: 'i'
                    }
                }
            },
            {
                $project: {
                    claveEmpleado: 1,
                    nombreCompleto: {
                        $concat: [
                            "$nombreEmpleado",
                            " ",
                            "$apellidoP",
                            " ",
                            { $ifNull: ["$apellidoM", ""] }
                        ]
                    },
                    departamento: 1,
                    puesto: 1,
                    coincidencia: {
                        $indexOfCP: [
                            { $toLower: "$claveEmpleado" },
                            { $toLower: termino }
                        ]
                    }
                }
            },
            {
                $sort: {
                    coincidencia: 1,  // Primero los que empiezan con el término
                    claveEmpleado: 1  // Orden alfabético
                }
            },
            {
                $limit: 10  // Limitar resultados para autocompletado
            },
            {
                $project: {
                    coincidencia: 0  // Eliminar campo temporal
                }
            }
        ]);
        
        res.status(200).json({
            exito: true,
            mensaje: resultados.length > 0
                ? 'Resultados encontrados'
                : 'No se encontraron coincidencias',
            total: resultados.length,
            empleados: resultados
        });
        
    } catch (error) {
        console.error('Error en búsqueda de empleados:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error en el servidor al realizar la búsqueda',
            error: error.message
        });
    }
});

// CU04: Listar empleados con datos importantes 
router.get('/listar', async (req, res) => {
    try {
        // Opcionalmente se pueden agregar parámetros de paginación
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        // Obtener los parámetros de filtro
        const {
            ciudad,
            sexo,
            puesto,
            departamento,
            nombre,
            apellidoP,
            apellidoM,
            fechaNacimiento,
            fechaAlta,
            fotoEmpleado,
            rol
        } = req.query;
        
        // Construir el objeto de filtro
        const filtro = {};
        
        // Agregar filtros solo si están presentes
        if (ciudad && ciudad !== '') filtro['domicilio.ciudad'] = ciudad;
        if (sexo && sexo !== '') filtro.sexo = sexo;
        if (puesto && puesto !== '') filtro.puesto = puesto;
        if (departamento && departamento !== '') filtro.departamento = departamento;
        if (rol && rol !== '') filtro.rol = parseInt(rol);
        
        // Filtros de nombre
        if (nombre && nombre !== '') {
            filtro.nombreEmpleado = { $regex: nombre, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
        }
        
        if (apellidoP && apellidoP !== '') {
            filtro.apellidoP = { $regex: apellidoP, $options: 'i' };
        }
        
        if (apellidoM && apellidoM !== '') {
            filtro.apellidoM = { $regex: apellidoM, $options: 'i' };
        }
        
        // Filtros de fecha
        if (fechaNacimiento && fechaNacimiento !== '') {
            // Convertir la fecha de string a Date para comparar
            const fecha = new Date(fechaNacimiento);
            filtro.fechaNacimiento = { $gte: fecha, $lt: new Date(fecha.getTime() + 86400000) }; // +1 día en ms
        }
        
        if (fechaAlta && fechaAlta !== '') {
            // Convertir la fecha de string a Date para comparar
            const fecha = new Date(fechaAlta);
            filtro.fechaAlta = { $gte: fecha, $lt: new Date(fecha.getTime() + 86400000) }; // +1 día en ms
        }
        
        console.log('Aplicando filtros:', filtro);
        
        // Buscar empleados con paginación y filtros
        const empleados = await Empleado.find(filtro)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ claveEmpleado: 1 }); // Ordenar por clave de empleado
        
        // Contar total de empleados para paginación (con filtros aplicados)
        const total = await Empleado.countDocuments(filtro);
        
        // Mapear solo los datos importantes para la lista
        const listaEmpleados = empleados.map(emp => ({
            claveEmpleado: emp.claveEmpleado,
            nombreCompleto: `${emp.nombreEmpleado} ${emp.apellidoP} ${emp.apellidoM || ''}`,
            departamento: emp.departamento,
            puesto: emp.puesto,
            fechaAlta: emp.fechaAlta,
            correoElectronico: emp.correoElectronico[0] || '',
            telefono: emp.telefono[0] || '',
            fotoEmpleado: emp.fotoEmpleado,
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

// Ruta para obtener los detalles completos de un empleado específico
router.get('/:claveEmpleado', async (req, res) => {
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


// CU10: Editar datos del empleado(empleado) 
router.put('/:claveEmpleado', async (req, res) => {
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

        // Eliminar campos que no se deben modificar de los datos enviados
        const camposProtegidos = [
            'claveEmpleado',
            'nombreEmpleado',
            'apellidoP',
            'apellidoM',
            'fechaAlta',
            'rfc',
            'fechaNacimiento'
        ];

        const datosPermitidos = { ...datosActualizados };
        camposProtegidos.forEach(campo => {
            delete datosPermitidos[campo];
        });
        
        // Actualizar solo los campos permitidos
        const empleadoActualizado = await Empleado.findOneAndUpdate(
            { claveEmpleado },
            datosPermitidos,
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

// CU10: Editar datos del empleado (para el admin)
router.put('/admin/:claveEmpleado', async (req, res) => {
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

        // Eliminar campos que no se deben modificar de los datos enviados
        const camposProtegidos = [
            'claveEmpleado', // No se puede modificar la clave del empleado
            'fechaAlta', // No se puede modificar la fecha de alta
        ];

        const datosPermitidos = { ...datosActualizados };
        camposProtegidos.forEach(campo => {
            delete datosPermitidos[campo];
        });

        // Actualizar solo los campos permitidos
        const empleadoActualizado = await Empleado.findOneAndUpdate(
            { claveEmpleado },
            datosPermitidos,
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

// CU12: Eliminar empleados
router.delete('/:claveEmpleado', async (req, res) => {
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