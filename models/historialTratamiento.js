import { DataTypes } from "sequelize";
import db from '../config/db.js';

const HistorialTratamiento = db.define(
    "historialtratamientos",
    {
        
        id_historial: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          fecha_administracion: {
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
          id_tratamiento: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Tratamiento',
                key: 'id_tratamiento'
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

export default HistorialTratamiento;