const jwt = require('jsonwebtoken');

// Middleware para autenticar y obtener la clave del empleado
const autenticarEmpleado = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'Acceso no autorizado' });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, '1294748329274929MA2827739028'); // Reemplaza con tu clave secreta
        req.claveEmpleado = decoded.claveEmpleado; // Almacena la clave del empleado en el request
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token inválido' });
    }
};

module.exports = { autenticarEmpleado };
