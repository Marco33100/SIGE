const express = require('express');
const ActividadEmpleado = require('../models/ActividadesEmpleado');
const Actividad = require('../models/Actividad');
const Estatus = require('../models/Estatus');
const Empleado = require('../models/Empleado');
const { autenticarEmpleado } = require('../middleware/authMiddleware');



const router = express.Router();

// CU06: Agregar actividades a empleado 
router.post('/agregarActividadEmpleado', async (req, res) => {
    try {
        const { claveEmpleado, nomActividad, descripcionAct, estatusActividad } = req.body;
        
        // Verificar que el empleado exista
        const empleadoExiste = await Empleado.findOne({ claveEmpleado });
        if (!empleadoExiste) {
            return res.status(404).json({ msg: 'El empleado no existe' });
        }
        
        // Verificar que la actividad exista
        const actividadExiste = await Actividad.findOne({ nomActividad });
        if (!actividadExiste) {
            return res.status(404).json({ msg: 'La actividad no existe en el catálogo' });
        }
        
        // Verificar que el estatus exista
        const estatusExiste = await Estatus.findOne({ estatus: estatusActividad });
        if (!estatusExiste && estatusActividad !== undefined) {
            return res.status(404).json({ msg: 'El estatus no existe en el catálogo' });
        }
        // Crear nueva actividad para el empleado
        const nuevaActividadEmpleado = new ActividadEmpleado({
            claveEmpleado,
            nomActividad,
            descripcionAct,
            estatusActividad: estatusActividad || 0
        });
        
        await nuevaActividadEmpleado.save();
        
        res.json({
            msg: 'Actividad asignada al empleado con éxito',
            actividad: nuevaActividadEmpleado,
            empleado: { claveEmpleado }
        });
        
    } catch (error) {
        console.error('Error al agregar actividad al empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CUI12: Mostrar estatus
router.get('/estatus', async (req, res) => {
    try {
        const estatusList = await Estatus.find();
        res.json(estatusList);
    } catch (error) {
        console.error('Error al obtener estatus:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CUI13: Mostrar nombre de actividades
router.get('/actividades', async (req, res) => {
    try {
        const actividades = await Actividad.find().select('nomActividad');
        res.json(actividades);
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// CU09: Visualizar actividades con filtros
router.get('/visualizarActividades', async (req, res) => {
    try {
        const { estatusActividad, claveEmpleado, nomActividad } = req.query;
        
        // Construir el filtro
        const filtro = [];
        
        if (estatusActividad !== undefined && estatusActividad !== '') {
            filtro.push({ estatusActividad: Number(estatusActividad) });
        }
        
        if (claveEmpleado && claveEmpleado !== '') {
            filtro.push({ claveEmpleado: claveEmpleado });
        }
        
        if (nomActividad && nomActividad !== '') {
            filtro.push({ nomActividad: nomActividad });
        }
        
        const actividades = filtro.length === 0
            ? await ActividadEmpleado.find()
            : await ActividadEmpleado.find({ $or: filtro });
        
        res.json({
            total: actividades.length,
            actividades
        });
    } catch (error) {
        console.error('Error al visualizar actividades:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});


// CU09: Visualizar actividades con filtros (solo para el empleado autenticado)
router.get('/visualizarActividadesE', autenticarEmpleado, async (req, res) => {
    try {
        const { estatusActividad, nomActividad } = req.query;
        const claveEmpleado = req.claveEmpleado; 

        // Construir el filtro
        const filtro = { claveEmpleado }; 

        if (estatusActividad !== undefined && estatusActividad !== '') {
            filtro.estatusActividad = Number(estatusActividad);
        }

        if (nomActividad && nomActividad !== '') {
            filtro.nomActividad = nomActividad;
        }

        const actividades = await ActividadEmpleado.find(filtro);

        res.json({
            total: actividades.length,
            actividades
        });
    } catch (error) {
        console.error('Error al visualizar actividades:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});




module.exports = router;

