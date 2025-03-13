const mongoose = require('mongoose');

const EstatusSchema = new mongoose.Schema({
    estatus: { 
        type: Number, 
        enum: [0, 1],
        default: 0 
    }
});

module.exports = mongoose.model('Estatus', EstatusSchema);