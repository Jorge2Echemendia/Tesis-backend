import mongoose from 'mongoose';

const configuracionSchema = new mongoose.Schema({
    tiempo_maximo_dia: {
        type: String,
        required: true,
        trim: true
    },
    afeccion: {
        type: String,
        required: true,
        trim: true
    },
    etapa: {
        type: String,
        required: true,
        trim: true
    },
    lente: {
        type: Boolean,
        default: false
    },
    parche: {
        type: Boolean,
        default: false
    },
    id_paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        default: null
    }
}, {
    timestamps: true
});

const Configuracion = mongoose.model('Configuracion', configuracionSchema);

export default Configuracion;