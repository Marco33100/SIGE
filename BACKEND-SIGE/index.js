require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const catalogoRoutes = require('./routes/catalogoRoutes');
const empleadosRoutes = require('./routes/empleadoRoutes');
const actividadesRoutes = require('./routes/actividadRoutes');
const cursosRoutes = require('./routes/cursoRoutes')

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EmpleadosDB';

// 🔥 Solución: Aumenta el límite del payload (10MB en este ejemplo)
app.use(express.json({ limit: '10mb' })); // ✅ Límite para JSON
app.use(express.urlencoded({ limit: '10mb', extended: true })); // ✅ Límite para URL-encoded

// Middlewares
app.use(cors());

// Rutas
app.use('/api/empleados', empleadosRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/catalogos', catalogoRoutes);

// Conexión a MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ Error de conexión:', err));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});