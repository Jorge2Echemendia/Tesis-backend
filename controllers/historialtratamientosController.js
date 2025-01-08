import HistorialTratamiento from "../models/historialTratamiento.js";
import Tratamiento from "../models/tratamiento.js";
import Paciente from "../models/paciente.js";

const crear = async (req, res) => {
    const { id_paciente } = req.params;

    const paciente = await Paciente.findById(id_paciente);
    if (!paciente) {
        return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    try {
        // Obtener todos los tratamientos asociados al paciente
        const tratamientos = await Tratamiento.find({ id_paciente: paciente._id });
        if (!tratamientos || tratamientos.length === 0) {
            return res.status(404).json({ 
                message: 'No se encontraron tratamientos asociados al paciente' 
            });
        }

        for (const t of tratamientos) {
            const { frecuencia, hora_programada, tiempo_de_la_medicacion } = t;

            // Convertir hora_programada a UTC
            const utcHourProgrammed = new Date(Date.UTC(
                hora_programada.getFullYear(), 
                hora_programada.getMonth(), 
                hora_programada.getDate(), 
                hora_programada.getHours(), 
                hora_programada.getMinutes()
            ));

            // Calcular las fechas de administración
            const fechasAdministracion = [];
            let fechaActual = new Date(utcHourProgrammed);

            for (let i = 0; i < frecuencia; i++) {
                fechasAdministracion.push(new Date(fechaActual));
                const [horas, minutos, segundos] = tiempo_de_la_medicacion.split(':').map(Number);
                fechaActual.setHours(
                    fechaActual.getHours() + horas, 
                    fechaActual.getMinutes() + minutos, 
                    fechaActual.getSeconds() + segundos
                );
            }
            const ultima_fecha = fechasAdministracion[fechasAdministracion.length - 1];

            // Verificar si ya existe un registro de historial para este tratamiento
            const existenteHistorial = await HistorialTratamiento.find({
                id_paciente: paciente._id
            }).sort('fecha_administracion');

            if (existenteHistorial.length === 0) {
                // Si no existe el historial, crear los nuevos registros
                const historialesData = fechasAdministracion.map(fecha => ({
                    fecha_administracion: fecha.toISOString(),
                    id_tratamiento: t._id,
                    id_paciente: paciente._id,
                    ultima_fecha: ultima_fecha.toISOString(),
                }));

                const historialCreado = await HistorialTratamiento.insertMany(historialesData);
                res.status(201).json(historialCreado);
            } else {
                // Si ya existe el historial, devolver el historial existente
                return res.status(200).json(existenteHistorial);
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            msg: 'Error al crear o verificar los historiales de tratamiento', 
            success: false 
        });
    }
};

const obtenerHistorial = async(req, res) => {
    const { id_tratamiento } = req.params;

    const tratamiento = await Tratamiento.findById(id_tratamiento);
    if (!tratamiento) {
        return res.status(404).json({ message: 'Tratamiento no encontrado' });
    }

    const paciente = await Paciente.findById(tratamiento.id_paciente);
    if (!paciente) {
        return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    try {
        const historial = await HistorialTratamiento.find({
            id_paciente: paciente._id
        });
        return res.status(200).json(historial);

    } catch(error) {
        console.error(error);
        res.status(500).json({ 
            msg: 'Error al encontrar los historiales de tratamiento', 
            success: false 
        });
    }
};

export { crear, obtenerHistorial };
