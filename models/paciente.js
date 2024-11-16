import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Paciente = db.define(
    "pacientes",
    {
      id_paciente: {
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
        
        fecha_nacimiento: {
          type: DataTypes.DATE,
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: true,
          },
        },
      afeccion: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      etapa_de_tratamiento: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
      
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Usuario',
                key: 'id_usuario'
            }
        },
        apellido_segundo: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        lente: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        parche: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        tipo_lente: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        tipo_parche: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        horas_parche: {
          type: DataTypes.STRING,
          defaultValue: null,
        },
        observaciones_parche: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        fecha_parche: {
          type: DataTypes.DATE,
          defaultValue: null,
        },
        graduacion_lente: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        fecha_lente: {
          type: DataTypes.DATE,
          defaultValue: null,
        },
        fecha_diagnostico: {
          type: DataTypes.DATE,
          defaultValue: null,
        },
        grado_miopia: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        examenes: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        recomendaciones: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        correcion_optica: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        ejercicios_visuales: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        cambio_optico: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        consejos_higiene: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        cirujia: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
        cirujia_fecha: {
          type: DataTypes.DATE,
          defaultValue: null,
        },
        cirujia_resultados: {
          type:  DataTypes.STRING(255),
          defaultValue: null,
        },
        progreso: {
          type: DataTypes.STRING(255),
          defaultValue: null,
        },
    },
  );


export default Paciente;