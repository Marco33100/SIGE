require('dotenv').config(); // Carga variables de entorno desde .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const empleadosRoutes = require('./routes/empleadoRoutes');
const actividadesRoutes = require('./routes/actividadRoutes');
const cursosRoutes = require('./routes/cursoRoutes')

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EmpleadosDB';

// Middlewares
app.use(cors()); // Permite solicitudes desde otros dominios
app.use(express.json()); // Habilita JSON en las solicitudes

// Rutas
app.use('/api/', empleadosRoutes);

//Actividades
app.use('/api/actividades', actividadesRoutes);

//Cursos
app.use('/api/cursos', cursosRoutes);

// Conexión a MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ Error de conexión:', err));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});
