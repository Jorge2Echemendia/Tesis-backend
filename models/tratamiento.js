import { DataTypes } from "sequelize";
import db from '../config/db.js';

const Tratamiento =db.define(
    "tratamientos",
    {
        id_tratamiento: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        nombre_medicamento: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              notEmpty: true,
            },
          },
          frecuencia: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
              notEmpty: true,
            },
          },
        hora_programada: {
          type: DataTypes.DATE,
          defaultValue: null,
        },
          id_paciente: {
              type: DataTypes.INTEGER,
              defaultValue:null,
              references: {
                  model: 'Paciente',
                  key: 'id_paciente'
              }
          },
          nombre_tratamiento: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              notEmpty: true,
            },
          },
          tiempo_de_la_medicacion: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              notEmpty: true,
            },
          },
        etapa: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        id_usuario: {
          type: DataTypes.INTEGER,
          allowNull: true,
      },
      lente: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      parche: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      },
    );
    export default Tratamiento;
