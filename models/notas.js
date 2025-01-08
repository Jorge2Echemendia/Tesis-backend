import mongoose from 'mongoose';

const notasSchema = new mongoose.Schema({
    nombre_notas: {
        type: String,
        required: true,
        trim: true
    },
    motivo: {
        type: String,
        required: true,
        trim: true
    },
    contenido: {
        type: String,
        required: true,
        trim: true
    },
    frecuencia: {
        type: Number,
        default: null
    },
    hora_programada: {
        type: Date,
        default: null
    },
    tiempo_de_intervalo: {
        type: String,
        default: null,
        trim: true
    },
    recordatorio: {
        type: Boolean,
        default: false
    },
    recordatorio_continuo: {
        type: Boolean,
        default: false
    },
    id_usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
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

const Notas = mongoose.model('Notas', notasSchema);

export default Notas;
