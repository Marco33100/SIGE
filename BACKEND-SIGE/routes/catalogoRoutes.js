const express = require('express');
const router = express.Router();
const Sexo = require('../models/Sexo');
const Parentesco = require('../models/Parentesco');
const Ciudad = require('../models/Ciudad');
const Departamento = require('../models/Departamento');
const Puesto = require('../models/Puesto');
const Rol = require('../models/Rol');

// Función genérica para obtener todos los elementos de un catálogo
const getAllCatalogItems = (Model, fieldName) => async (req, res) => {
  try {
    const items = await Model.find({}, { _id: 1, [fieldName]: 1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rutas GET para cada catálogo con el campo correspondiente
router.get('/sexo', getAllCatalogItems(Sexo, 'sexo'));
router.get('/parentesco', getAllCatalogItems(Parentesco, 'parentesco'));
router.get('/ciudad', getAllCatalogItems(Ciudad, 'nomCiudad'));
router.get('/departamento', getAllCatalogItems(Departamento, 'nomDepartamento'));
router.get('/puesto', getAllCatalogItems(Puesto, 'nomPuesto'));
router.get('/rol', getAllCatalogItems(Rol, 'rol'));

module.exports = router;
