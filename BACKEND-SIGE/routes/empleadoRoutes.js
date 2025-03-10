const express = require('express');
const Empleado = require('../models/Empleado');

const router = express.Router();

// 🔐 Inicio de sesión (CU01)
router.post('/login', async (req, res) => {
    const { claveEmpleado, contraseña } = req.body;
    const empleado = await Empleado.findOne({ claveEmpleado });

    if (!empleado || contraseña !== empleado.contraseña) {
        return res.status(401).json({ msg: 'Credenciales inválidas' });
    }

    // Respuesta de éxito sin token
    res.json({ msg: 'Login exitoso', empleado });
});

// ➕ Registrar nuevo empleado (CU02)
router.post('/registro', async (req, res) => {
    try {
        const nuevoEmpleado = new Empleado(req.body);
        await nuevoEmpleado.save();
        res.json({ msg: 'Empleado registrado con éxito' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al registrar empleado', error });
    }
});

// 🔍 Buscar empleado para gestionar (CU03)
router.get('/buscar/:claveEmpleado', async (req, res) => {
    const empleado = await Empleado.findOne({ claveEmpleado: req.params.claveEmpleado });
    if (!empleado) return res.status(404).json({ msg: 'Empleado no encontrado' });
    res.json(empleado);
});

// 📋 Listar empleados con filtros (CU04)
router.get('/listar', async (req, res) => {
    const filtros = req.query;
    const empleados = await Empleado.find(filtros);
    res.json(empleados);
});

// ✏️ Editar empleado (CUE01)
router.put('/editar/:claveEmpleado', async (req, res) => {
    try {
        await Empleado.updateOne({ claveEmpleado: req.params.claveEmpleado }, req.body);
        res.json({ msg: 'Empleado actualizado' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar', error });
    }
});

// 🗑️ Eliminar empleado (CUE02)
router.delete('/eliminar/:claveEmpleado', async (req, res) => {
    await Empleado.deleteOne({ claveEmpleado: req.params.claveEmpleado });
    res.json({ msg: 'Empleado eliminado' });
});

module.exports = router;