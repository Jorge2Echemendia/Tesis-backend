import { DataTypes } from "sequelize";
import db from '../config/db.js';

const Configuracion = db.define(
    "configuracionesusotelefono",
    {
        
        id_configuracion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          tiempo_maximo_dia: {
            type: DataTypes.STRING,
            allowNull: false,
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
          etapa: {
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

export default Configuracion;