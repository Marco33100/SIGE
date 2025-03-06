const express = require('express');
const router = express.Router();
const { Empleado } = require('../models'); // Importamos el modelo Empleado

// Obtener todos los empleados
router.get('/', async (req, res) => {
    try {
        const empleados = await Empleado.find();
        res.status(200).json(empleados);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener empleados', error: error.message });
    }
});

// Crear un nuevo empleado
router.post('/', async (req, res) => {
    try {
        const nuevoEmpleado = new Empleado(req.body);
        await nuevoEmpleado.save();
        res.status(201).json({ mensaje: 'Empleado creado correctamente', empleado: nuevoEmpleado });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear empleado', error: error.message });
    }
});

// Actualizar un empleado por claveEmpleado
router.put('/:claveEmpleado', async (req, res) => {
    try {
        const { claveEmpleado } = req.params;
        const empleadoActualizado = await Empleado.findOneAndUpdate(
            { claveEmpleado },
            req.body,
            { new: true, runValidators: true } // Asegura que se validen los datos actualizados
        );
        if (!empleadoActualizado) {
            return res.status(404).json({ mensaje: 'Empleado no encontrado' });
        }
        res.status(200).json(empleadoActualizado);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar empleado', error: error.message });
    }
});

// Eliminar un empleado por claveEmpleado
router.delete('/:claveEmpleado', async (req, res) => {
    try {
        const empleadoEliminado = await Empleado.findOneAndDelete({ claveEmpleado: req.params.claveEmpleado });
        if (!empleadoEliminado) {
            return res.status(404).json({ mensaje: 'Empleado no encontrado' });
        }
        res.status(204).send(); // 204: No Content
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar empleado', error: error.message });
    }
});

module.exports = router;