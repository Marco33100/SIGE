const express = require('express');
const ActividadEmpleado = require('../models/ActividadesEmpleado');
const Actividad = require('../models/Actividad');
const Estatus = require('../models/Estatus');
const Empleado = require('../models/Empleado');


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
        
        // Verificar que la actividad exista en el catálogo
        const actividadExiste = await Actividad.findOne({ nomActividad });
        if (!actividadExiste) {
            return res.status(404).json({ msg: 'La actividad no existe en el catálogo' });
        }
        
        // Verificar que el estatus exista en el catálogo
        const estatusExiste = await Estatus.findOne({ estatus: estatusActividad });
        if (!estatusExiste && estatusActividad !== undefined) {
            return res.status(404).json({ msg: 'El estatus especificado no existe en el catálogo' });
        }
        
        // Crear nueva actividad para el empleado
        const nuevaActividadEmpleado = new ActividadEmpleado({
            claveEmpleado,
            nomActividad,
            descripcionAct,
            estatusActividad: estatusActividad || 0 // Usa el valor por defecto (0) si no se proporciona
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




module.exports = router;

