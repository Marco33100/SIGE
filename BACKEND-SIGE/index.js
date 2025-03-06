const express = require('express');
const mongoose = require('mongoose');
const empleadoRoutes = require('./routes/empleadoRoutes'); // Corregí la ruta de importación

const app = express();
app.use(express.json()); // Middleware para leer JSON en las peticiones

// Configurar las rutas
app.use('/empleados', empleadoRoutes); // Endpoints disponibles en /empleados

const PORT = 3000;
mongoose.connect('mongodb://localhost:27017/EmpleadosDB')
    .then(() => {
        console.log('✅ Conectado a MongoDB');
        app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
    })
    .catch(error => console.error('❌ Error al conectar a MongoDB:', error));