import mongoose from 'mongoose';

const historialTratamientoSchema = new mongoose.Schema({
    fecha_administracion: {
        type: Date,
        required: true
    },
    ultima_fecha: {
        type: Date,
        required: true
    },
    id_tratamiento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tratamiento',
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

const HistorialTratamiento = mongoose.model('HistorialTratamiento', historialTratamientoSchema);

export default HistorialTratamiento;