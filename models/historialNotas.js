import mongoose from 'mongoose';

const historialNotasSchema = new mongoose.Schema({
    fechas: {
        type: Date,
        required: true
    },
    ultima_fecha: {
        type: Date,
        required: true
    },
    id_notas: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notas',
        default: null
    },
    id_paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        default: null
    }
}, {
    timestamps: true
});

const HistorialNotas = mongoose.model('HistorialNotas', historialNotasSchema);

export default HistorialNotas;