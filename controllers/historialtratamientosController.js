import HistorialTratamiento from "../models/historialTratamiento.js";
import Tratamiento from "../models/tratamiento.js";
import Paciente from "../models/paciente.js";
import { Op, where } from 'sequelize';


const crear = async (req, res) => {
    const { id_paciente } = req.params;

    const paciente = await Paciente.findOne({ where: { id_paciente: id_paciente } });
    if (!paciente) {
        return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    try {
        // Obtener todos los tratamientos asociados al paciente
        const tratamiento = await Tratamiento.findAll({where:{id_paciente: paciente.id_paciente}});
        if (!tratamiento || tratamiento.length === 0) {
            return res.status(404).json({ message: 'No se encontraron tratamientos asociados al paciente' });
        }

        for (const t of tratamiento) {
            const { frecuencia, hora_programada, tiempo_de_la_medicacion } = t;

            // Convertir hora_programada a UTC
            const utcHourProgrammed = new Date(Date.UTC(hora_programada.getFullYear(), hora_programada.getMonth(), hora_programada.getDate(), hora_programada.getHours(), hora_programada.getMinutes()));

            // Calcular las fechas de administración
            const fechasAdministracion = [];
            let fechaActual = new Date(utcHourProgrammed);

            for (let i = 0; i < frecuencia; i++) {
                fechasAdministracion.push(new Date(fechaActual));
                const [horas, minutos, segundos] = tiempo_de_la_medicacion.split(':').map(Number);
                fechaActual.setHours(fechaActual.getHours() + horas, fechaActual.getMinutes() + minutos, fechaActual.getSeconds() + segundos);
            }
            const ultima_fecha = fechasAdministracion[fechasAdministracion.length - 1];

            // Verificar si ya existe un registro de historial para este tratamiento
            const existenteHistorial = await HistorialTratamiento.findAll({
                where: {
                    //id_tratamiento: t.id_tratamiento,
                    id_paciente: paciente.id_paciente
                },
                order: [['fecha_administracion', 'ASC']]
            });

            if (existenteHistorial.length === 0) {
                // Si no existe el historial, crear los nuevos registros
                const historialPromises = fechasAdministracion.map(fecha => {
                    return HistorialTratamiento.create({
                        fecha_administracion: fecha.toISOString(),
                        id_tratamiento: t.id_tratamiento,
                        id_paciente: paciente.id_paciente,
                        ultima_fecha: ultima_fecha.toISOString(),
                    });
                });
                const historialCreado = await Promise.all(historialPromises);
                res.status(201).json(historialCreado);
            } else {
                // Si ya existe el historial, devolver el historial existente
                return res.status(200).json(existenteHistorial);
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear o verificar los historiales de tratamiento', success: false });
    }
};


const obtenerHistorial=async(req, res)=>{
    const { id_tratamiento } = req.params;

    const tratamiento= await Tratamiento.findOne({where:{id_tratamiento}});

    if (!tratamiento) {
        return res.status(404).json({ message: 'Tratamiento no encontrado' });
    }


    const paciente = await Paciente.findOne({ where: { id_paciente: tratamiento.id_paciente } });
    if (!paciente) {
        return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    try{

        const historial= await HistorialTratamiento.findAll({where:{id_paciente:paciente.id_paciente}});
        return res.status(200).json(historial);

    }catch(error){
        console.error(error);
        res.status(500).json({ msg: 'Error al encontrar los historiales de tratamiento', success: false });
    }
}


// Función para eliminar registros de HistorialTratamiento
const eliminarHistorialPorUltimaFecha = async () => {
    try {
        const fechaLimite = new Date();
        // Eliminar todos los registros que tengan la ultima_fecha menor o igual a la fecha actual
        fechaLimite.setMinutes(fechaLimite.getMinutes() - 5);
        await HistorialTratamiento.destroy({
            where: {
                ultima_fecha: {
                    [Op.lte]: fechaLimite,
                },
            },
        });
        console.log('Registros de HistorialTratamiento eliminados exitosamente');
    } catch (error) {
        console.error('Error al eliminar registros de HistorialTratamiento:', error);
    }
};


export {crear, eliminarHistorialPorUltimaFecha,obtenerHistorial};
