import { DataTypes } from "sequelize";
import db from '../config/db.js';

const Notas =db.define(
    "notas",
    {
        id_notas: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        nombre_notas: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        motivo: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              notEmpty: true,
            },
          },
        contenido: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              notEmpty: true,
            },
          },
          frecuencia: {
            type: DataTypes.INTEGER,
            defaultValue: null,
          },
        hora_programada: {
          type: DataTypes.DATE,
          defaultValue: null,
        },
        tiempo_de_intervalo: {
            type: DataTypes.STRING,
            defaultValue: null,
            },
            recordatorio: {
              type: DataTypes.BOOLEAN,
              defaultValue: false,
            },
            recordatorio_continuo: {
              type: DataTypes.BOOLEAN,
              defaultValue: false,
            },
            id_usuario: {
                type: DataTypes.INTEGER,
              defaultValue:null,
              references: {
                  model: 'Usuario',
                  key: 'id_usuario'
              }
            },
          id_paciente: {
              type: DataTypes.INTEGER,
              defaultValue:null,
              references: {
                  model: 'Paciente',
                  key: 'id_paciente'
              }
          },
      },
    );
    export default Notas;
