const express = require('express');
const Empleado = require('../models/Empleado');

const router = express.Router();

// 🔐 Inicio de sesión (CU01)
router.post('/login', async (req, res) => {
    try {
        const { claveEmpleado, contraseña } = req.body;
        const empleado = await Empleado.findOne({ claveEmpleado });

        if (!empleado || contraseña !== empleado.contraseña) {
            return res.status(401).json({ msg: 'Credenciales inválidas' });
        }
        res.json({ 
            msg: 'Login exitoso', 
            empleado: {
                claveEmpleado: empleado.claveEmpleado,
                nombreEmpleado: empleado.nombreEmpleado,
                apellidoP: empleado.apellidoP,
                apellidoM: empleado.apellidoM,
                rol: empleado.rol // 👈 Ahora se incluye el rol en la respuesta
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// ➕ Registrar nuevo empleado (CU02)
router.post('/registro', async (req, res) => {
    try {
        const nuevoEmpleado = new Empleado(req.body);
        await nuevoEmpleado.save();
        res.json({ msg: 'Empleado registrado con éxito' });
    } catch (error) {
        console.error('Error al registrar empleado:', error);
        res.status(500).json({ msg: 'Error al registrar empleado', error });
    }
});

// 🔍 Buscar empleado para gestionar (CU03)
router.get('/buscar/:claveEmpleado', async (req, res) => {
    try {
        const empleado = await Empleado.findOne({ claveEmpleado: req.params.claveEmpleado });

        if (!empleado) {
            return res.status(404).json({ msg: 'Empleado no encontrado' });
        }

        res.json(empleado);
    } catch (error) {
        console.error('Error al buscar empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// 📋 Listar empleados con filtros (CU04)
router.get('/listar', async (req, res) => {
    try {
        const filtros = req.query;
        const empleados = await Empleado.find(filtros);
        res.json(empleados);
    } catch (error) {
        console.error('Error al listar empleados:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// ✏️ Editar empleado (CUE01)
router.put('/editar/:claveEmpleado', async (req, res) => {
    try {
        const result = await Empleado.updateOne({ claveEmpleado: req.params.claveEmpleado }, req.body);
        
        if (result.modifiedCount === 0) {
            return res.status(404).json({ msg: 'Empleado no encontrado o sin cambios' });
        }

        res.json({ msg: 'Empleado actualizado' });
    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

// 🗑️ Eliminar empleado (CUE02)
router.delete('/eliminar/:claveEmpleado', async (req, res) => {
    try {
        const result = await Empleado.deleteOne({ claveEmpleado: req.params.claveEmpleado });

        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'Empleado no encontrado' });
        }

        res.json({ msg: 'Empleado eliminado' });
    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
});

module.exports = router;
