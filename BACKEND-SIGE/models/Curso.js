const mongoose = require('mongoose');

const CursoSchema = new mongoose.Schema({
    nomCurso: {type: String, required: true, unique: true}
});

module.exports = mongoose.model('Curso', CursoSchema);