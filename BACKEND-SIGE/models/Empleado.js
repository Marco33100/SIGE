// CU02: Registrar un nuevo empleado
router.post('/registrar', async (req, res) => {
    try {
        // Validar campos obligatorios según el esquema
        const camposObligatorios = [
            'nombreEmpleado', 'apellidoP', 'contraseña',
            'fechaNacimiento', 'sexo', 'departamento', 'puesto', 'rol'
        ];
        // Nota: quitamos 'claveEmpleado' de los campos obligatorios ya que lo generaremos automáticamente
        
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
        
        // Generar clave de empleado (RASG-001)
        const nombreCompleto = req.body.nombreEmpleado.split(' ');
        let iniciales = '';
        
        // Obtener iniciales del nombre (todos los nombres)
        for (let i = 0; i < nombreCompleto.length; i++) {
            iniciales += nombreCompleto[i].charAt(0);
        }
        
        // Añadir inicial de apellido paterno
        iniciales += req.body.apellidoP.charAt(0);
        
        // Añadir inicial de apellido materno si existe
        if (req.body.apellidoM && req.body.apellidoM.length > 0) {
            iniciales += req.body.apellidoM.charAt(0);
        }
        
        iniciales = iniciales.toUpperCase();
        
        // Buscar el último consecutivo para esta combinación de iniciales
        const ultimoEmpleado = await Empleado.findOne(
            { claveEmpleado: new RegExp(`^${iniciales}-\\d+$`) },
            {},
            { sort: { claveEmpleado: -1 } }
        );
        
        let consecutivo = 1;
        if (ultimoEmpleado) {
            // Extraer el número consecutivo actual y aumentarlo en 1
            const partes = ultimoEmpleado.claveEmpleado.split('-');
            consecutivo = parseInt(partes[1]) + 1;
        }
        
        // Formatear el consecutivo a 3 dígitos (001, 002, etc.)
        const consecutivoStr = consecutivo.toString().padStart(3, '0');
        const claveEmpleado = `${iniciales}-${consecutivoStr}`;
        
        // Generar RFC (SIGR-770910) - primeras letras de apellidos y nombre + fecha nacimiento
        let rfc = '';
        
        // Primeras dos letras del apellido paterno
        if (req.body.apellidoP.length >= 2) {
            rfc += req.body.apellidoP.substring(0, 2).toUpperCase();
        } else {
            rfc += req.body.apellidoP.toUpperCase();
        }
        
        // Primera letra del apellido materno
        if (req.body.apellidoM && req.body.apellidoM.length > 0) {
            rfc += req.body.apellidoM.charAt(0).toUpperCase();
        }
        
        // Primera letra del nombre
        rfc += req.body.nombreEmpleado.charAt(0).toUpperCase();
        
        // Fecha de nacimiento en formato YYMMDD
        const fechaNac = new Date(req.body.fechaNacimiento);
        const anio = fechaNac.getFullYear().toString().substr(-2);
        const mes = (fechaNac.getMonth() + 1).toString().padStart(2, '0');
        const dia = fechaNac.getDate().toString().padStart(2, '0');
        
        rfc += `-${anio}${mes}${dia}`;
        
        // Preparar objeto completo de empleado
        const empleadoData = {
            claveEmpleado: claveEmpleado, // Clave generada automáticamente
            nombreEmpleado: req.body.nombreEmpleado,
            apellidoP: req.body.apellidoP,
            apellidoM: req.body.apellidoM || '',
            contraseña: req.body.contraseña,
            // fechaAlta se generará automáticamente con Date.now() por el esquema
            rfc: req.body.rfc || rfc, // Usar el RFC generado si no se proporciona
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
                rfc: nuevoEmpleado.rfc,
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
