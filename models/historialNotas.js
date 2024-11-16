import { DataTypes } from "sequelize";
import db from '../config/db.js';

const HistorialNotas = db.define(
    "historialnotas",
    {
        
        id_historial_notas: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          fechas: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
              notEmpty: true,
            },
          },
          ultima_fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
              notEmpty: true,
            },
          },
          id_notas: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Notas',
                key: 'id_notas'
            }
        },
            id_paciente: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Paciente',
                    key: 'id_paciente'
                }
            },
    }
);

export default HistorialNotas;