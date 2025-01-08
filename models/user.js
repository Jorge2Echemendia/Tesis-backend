import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import generarId from "../helpers/generarId.js";

const usuarioSchema = new mongoose.Schema({
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
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        default: null
    },
    imagen: {
        type: String,
        default: null
    },
    token: {
        type: String,
        default: null
    },
    confirmado: {
        type: Boolean,
        default: false
    },
    tipo_usuario: {
        type: String,
        default: null
    },
    notificacion_token: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Esto reemplaza createdAt y updatedAt de Sequelize
});

// Middleware pre-save (equivalente a beforeCreate y beforeUpdate)
usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    if (this.email.includes('.doctor')) {
        this.tipo_usuario = 'doctor';
    } else {
        this.tipo_usuario = 'cliente';
    }
    
    if (this.isNew || this.isModified('email')) {
        this.token = generarId();
        if (this.isModified('email')) {
            this.confirmado = false;
        }
    }
});

// Método para comprobar password
usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    if (typeof passwordFormulario !== 'string' || typeof this.password !== 'string') {
        return false;
    }
    return await bcrypt.compare(passwordFormulario, this.password);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
