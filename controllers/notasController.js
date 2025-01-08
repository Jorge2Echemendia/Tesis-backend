import moment from 'moment';
import HistorialNotas from '../models/historialNotas.js';
import Notas from '../models/notas.js';

const crearNota = async (req, res) => {
    try {
        const {id_paciente} = req.params;
        const notaData = {
            ...req.body,
            id_usuario: req.usuario._id,
            id_paciente
        };

        const notaCreada = await Notas.create(notaData);

        if(notaCreada.hora_programada !== null && notaCreada.tiempo_de_intervalo !== null) {
            const fechasAdministracion = [];
            let fechaActual = new Date(notaCreada.hora_programada);
    
            // Calcular nuevas fechas de administración
            for (let i = 0; i < notaCreada.frecuencia; i++) {
                // Crear una nueva instancia de Date para cada iteración
                const nuevaFecha = new Date(fechaActual);
                fechasAdministracion.push(nuevaFecha);

                // Separar el tiempo de intervalo
                const [horas, minutos] = notaCreada.tiempo_de_intervalo.split(':').map(Number);
                
                // Calcular la siguiente fecha
                fechaActual = new Date(fechaActual.getTime() + (horas * 60 * 60 * 1000) + (minutos * 60 * 1000));
                
                console.log(`Fecha ${i + 1}:`, nuevaFecha.toISOString());
            }

            const ultima_fecha = new Date(fechasAdministracion[fechasAdministracion.length - 1]);
            
            console.log('Última fecha:', ultima_fecha.toISOString());
    
            // Crear el historial
            const historialParaInsertar = fechasAdministracion.map(fecha => ({
                fechas: new Date(fecha.getTime() - (5 * 60 * 60 * 1000)), // Ajuste de -5 horas
                id_notas: notaCreada._id,
                id_paciente: notaCreada.id_paciente,
                ultima_fecha: ultima_fecha,
            }));

            await HistorialNotas.insertMany(historialParaInsertar);
        }

        return res.status(201).json({
            msg: "Creado Correctamente",
            success: true,
            notaCreada
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ msg: 'Error al crear la nota.', success: false });
    }
};

const eliminarNota = async (req, res) => {
    const { id_notas } = req.params;
    const nota = await Notas.findById(id_notas);

    if (!nota) {
        return res.status(400).json({ msg: 'ID de la nota no encontrado.', success: false });
    }

    if (nota.id_usuario.toString() !== req.usuario._id.toString()) {
        return res.json({ msg: 'Accion no valida', success: false });
    }

    try {
        await HistorialNotas.deleteMany({
            id_paciente: nota.id_paciente,
            id_notas: nota._id
        });
        
        await nota.deleteOne();
        return res.status(200).json({ msg: 'Nota eliminada exitosamente.', success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al eliminar nota.', success: false });
    }
};

const listarNotas = async (req, res) => {
    if (req.usuario.tipo_usuario !== "cliente") {
        return res.status(403).json({ 
            msg: "No tienes acceso a esta funcionalidad",
            success: false,
            user: req.usuario
        });
    }

    const {id_paciente} = req.params;
    try {
        const notas = await Notas.find({ id_paciente });
        return res.status(200).json(notas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al obtener las notas.', success: false });
    }
};

const modificarNota = async (req, res) => {
    const { id_notas } = req.params;
    const nota = await Notas.findById(id_notas);

    if (!nota) {
        return res.status(404).json({ msg: 'Nota no encontrada', success: false });
    }

    try {
        if (nota.hora_programada !== req.body.hora_programada && req.body.recordatorio_continuo === true || 
            nota.frecuencia !== req.body.frecuencia || nota.tiempo_de_intervalo !== req.body.tiempo_de_intervalo) {
            
            const fechasAdministracion = [];
            let fechaActual = moment(req.body.hora_programada);

            // Calcular nuevas fechas de administración
            for (let i = 0; i < (req.body.frecuencia || nota.frecuencia); i++) {
                fechasAdministracion.push(fechaActual.clone());
                const [horas, minutos, segundos] = (req.body.tiempo_de_intervalo || nota.tiempo_de_intervalo).split(':').map(Number);
                fechaActual.add(horas, 'hours')
                          .add(minutos, 'minutes')
                          .add(segundos, 'seconds');
            }
            
            const ultima_fecha = fechasAdministracion[fechasAdministracion.length - 1];

            // Eliminar registros anteriores
            await HistorialNotas.deleteMany({
                id_notas: nota._id,
                id_paciente: nota.id_paciente
            });

            // Crear nuevos registros
            await HistorialNotas.insertMany(
                fechasAdministracion.map(fecha => ({
                    fechas: fecha,
                    id_notas: nota._id,
                    id_paciente: nota.id_paciente,
                    ultima_fecha
                }))
            );
        } else if(nota.hora_programada !== req.body.hora_programada && req.body.recordatorio === true) {
            await HistorialNotas.deleteMany({
                id_notas: nota._id,
                id_paciente: nota.id_paciente
            });
        }

        const notaActualizada = await Notas.findByIdAndUpdate(
            id_notas,
            {
                nombre_notas: req.body.nombre_notas || nota.nombre_notas,
                motivo: req.body.motivo || nota.motivo,
                contenido: req.body.contenido || nota.contenido,
                frecuencia: req.body.frecuencia !== 1 ? req.body.frecuencia : nota.frecuencia,
                hora_programada: req.body.hora_programada || nota.hora_programada,
                tiempo_de_intervalo: req.body.tiempo_de_intervalo || nota.tiempo_de_intervalo,
                recordatorio: req.body.recordatorio === undefined ? nota.recordatorio : req.body.recordatorio,
                recordatorio_continuo: req.body.recordatorio_continuo === undefined ? nota.recordatorio_continuo : req.body.recordatorio_continuo,
                id_paciente: req.body.id_paciente || nota.id_paciente,
                id_usuario: req.body.id_usuario || nota.id_usuario
            },
            { new: true }
        );

        res.status(200).json({ 
            msg: 'Nota actualizada exitosamente', 
            success: true, 
            data: notaActualizada 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar la nota', success: false });
    }
};

const listalHistorialNotas = async(req, res) => {
    const {id_paciente} = req.params;
    try {
        const data = await HistorialNotas.find({ id_paciente });
        return res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            msg: 'Error al obtener el historial de notas.', 
            success: false 
        });
    }
};

export {
    crearNota, eliminarNota,
    listalHistorialNotas, listarNotas, modificarNota
};
