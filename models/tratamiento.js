import mongoose from 'mongoose';

const tratamientoSchema = new mongoose.Schema({
    nombre_medicamento: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    frecuencia: {
        type: Number,
        required: true
    },
    hora_programada: {
        type: Date,
        default: null
    },
    id_paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        default: null
    },
    nombre_tratamiento: {
        type: String,
        required: true,
        trim: true
    },
    tiempo_de_la_medicacion: {
        type: String,
        required: true,
        trim: true
    },
    etapa: {
        type: String,
        required: true,
        trim: true
    },
    id_usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        default: null
    },
    lente: {
        type: Boolean,
        default: false
    },
    parche: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Tratamiento = mongoose.model('Tratamiento', tratamientoSchema);

export default Tratamiento;
