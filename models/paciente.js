import mongoose from 'mongoose';

const pacienteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    fecha_nacimiento: {
        type: Date,
        required: true
    },
    afeccion: {
        type: String,
        required: true,
        trim: true
    },
    etapa_de_tratamiento: {
        type: String,
        required: true,
        trim: true
    },
    id_usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    apellido_segundo: {
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
    tipo_lente: {
        type: String,
        default: null
    },
    tipo_parche: {
        type: String,
        default: null
    },
    horas_parche: {
        type: String,
        default: null
    },
    observaciones_parche: {
        type: String,
        default: null
    },
    fecha_parche: {
        type: Date,
        default: null
    },
    graduacion_lente: {
        type: String,
        default: null
    },
    fecha_lente: {
        type: Date,
        default: null
    },
    fecha_diagnostico: {
        type: Date,
        default: null
    },
    grado_miopia: {
        type: String,
        default: null
    },
    examenes: {
        type: String,
        default: null
    },
    recomendaciones: {
        type: String,
        default: null
    },
    correcion_optica: {
        type: String,
        default: null
    },
    ejercicios_visuales: {
        type: String,
        default: null
    },
    cambio_optico: {
        type: String,
        default: null
    },
    consejos_higiene: {
        type: String,
        default: null
    },
    cirujia: {
        type: String,
        default: null
    },
    cirujia_fecha: {
        type: Date,
        default: null
    },
    cirujia_resultados: {
        type: String,
        default: null
    },
    progreso: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Esto añadirá createdAt y updatedAt automáticamente
});

const Paciente = mongoose.model('Paciente', pacienteSchema);

export default Paciente;