import { DataTypes } from "sequelize";
import db from "../config/db.js";
import bcrypt from "bcrypt";
import generarId from "../helpers/generarId.js";

const Usuario = db.define(
  "usuarios",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    telefono: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    imagen: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
    token: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    confirmado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tipo_usuario: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    notificacion_token: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
  },
  {hooks: {
    beforeCreate: async (usuario) => {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(usuario.password, salt);
      if (usuario.email.includes(".doctor")) {
        usuario.tipo_usuario = "doctor";
      } else {
        usuario.tipo_usuario = "cliente";
      }
      usuario.token=generarId();

    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed("password")) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
      if (usuario.changed("email") && usuario.email !== usuario.previous("email")) {
    usuario.token = generarId();
    usuario.confirmado = false;
  }
    },
  },
  }
);
// Método de instancia para comprobar la contraseña
Usuario.prototype.comprobarPassword = async function (passwordFormulario) {
  return await bcrypt.compare(passwordFormulario, this.password);
};

export default Usuario;
