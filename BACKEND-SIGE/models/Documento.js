const mongoose = require('mongoose');

const DocumentoSchema = new mongoose.Schema({
    nomDocumento: String
});

module.exports = mongoose.model('Documento', DocumentoSchema);