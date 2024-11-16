import HistorialNotas from '../models/historialNotas.js'
import Notas from '../models/notas.js';
import moment  from 'moment'


const crearNota = async (req, res) => {
    const notas = new Notas(req.body);
    const {id_paciente} =req.params;
    console.log(`${id_paciente}`);
    notas.id_usuario=req.usuario.id_usuario;
    try {
        notas.id_paciente=id_paciente;
        const notaCreada = await notas.save();
        if(notaCreada.hora_programada!==null && notaCreada.tiempo_de_intervalo!==null){
            const fechasAdministracion = [];
            let fechaActual =new Date(notaCreada.hora_programada);
    
            // Calcular nuevas fechas de administración
            for (let i = 0; i < notaCreada.frecuencia; i++) {
                fechasAdministracion.push(new Date(fechaActual));
                const [horas, minutos, segundos] = notaCreada.tiempo_de_intervalo.split(':').map(Number);
                fechaActual.setHours(fechaActual.getHours() + horas, fechaActual.getMinutes() + minutos, fechaActual.getSeconds() + segundos);
            }
            const ultima_fecha = fechasAdministracion[fechasAdministracion.length - 1];
    
            await Promise.all(fechasAdministracion.map(fecha => {
                        HistorialNotas.create({
                        fechas:fecha.setHours(fecha.getHours()-5),
                        id_notas: notaCreada.id_notas,
                        id_paciente: notaCreada.id_paciente,
                        ultima_fecha: ultima_fecha,
                    });
                }));
        }
            return res.status(201).json({
                msg: "Creado Correctamente",
                success:true,
                notaCreada:notaCreada
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al crear la nota.' ,success:false});
    }
};


const eliminarNota = async (req, res) => {
    const { id_notas} = req.params;
    const nota =await Notas.findOne({ where: { id_notas } });

    if (!nota) {
        return res.status(400).json({ msg: 'ID del paciente no encontrado.',success:false });
    }

    if (nota.id_usuario.toString()!==req.usuario.id_usuario.toString()) {
        return res.json({ msg: 'Accion no valida',success:false });
    }
    const historialnota= await HistorialNotas.findAll({
        where:{
            id_paciente:nota.id_paciente,
            id_notas:nota.id_notas
        }
    })
    try {
        if(historialnota){
            for (const historialItem of historialnota) {
                await historialItem.destroy();
            }}
        await nota.destroy();
        return res.status(200).json({ msg: 'Nota eliminado exitosamente.',success:true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al eliminar nota.',success:false });
    }
};


const listarNotas = async (req, res) => {
    if (req.usuario.tipo_usuario !== "cliente") {
        console.log(`${req.usuario.tipo_usuario}`)
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ msg: error.message ,success:false,user:req.usuario});
        }
        const {id_paciente}=req.params;
    try {
    const notas = await Notas.findAll({
        where:{
            id_paciente
        }
    });
    return res.status(200).json(notas);
} catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Error al obtener las configuraciones.', success: false });
}
};


const modificarNota = async (req, res) => {
    const { id_notas} = req.params;
    const nota =await Notas.findOne({ where: { id_notas } });

    if (!nota) {
        return res.status(404).json({ msg: 'Nota no encontrado', success: false });
    }

    try {
    if (nota.hora_programada !== req.body.hora_programada && req.body.recordatorio_continuo===true|| nota.frecuencia !== req.body.frecuencia ||nota.tiempo_de_intervalo !== req.body.tiempo_de_intervalo  ) {
        nota.nombre_notas =
        req.body.nombre_notas ||nota.nombre_notas;
        nota.motivo =
        req.body.motivo || nota.motivo;
        nota.contenido =
        req.body.contenido || nota.contenido;
        nota.frecuencia = req.body.frecuencia !== 1 ? req.body.frecuencia : nota.frecuencia;
        nota.hora_programada =
        req.body.hora_programada || nota.hora_programada;
        nota.tiempo_de_intervalo =
        req.body.tiempo_de_intervalo || nota.tiempo_de_intervalo;
        nota.recordatorio=undefined ? nota.recordatorio : req.body.recordatorio;
        nota.recordatorio_continuo=undefined ? nota.recordatorio_continuo : req.body.recordatorio_continuo;
        nota.id_paciente=  req.body.id_paciente ||nota.id_paciente;
        nota.id_usuario=  req.body.id_usuario ||nota.id_usuario;
        
        const fechasAdministracion = [];
        let fechaActual = moment(req.body.hora_programada);

        // Calcular nuevas fechas de administración
        for (let i = 0; i < nota.frecuencia; i++) {
            fechasAdministracion.push(fechaActual.clone());
            const [horas, minutos, segundos] = nota.tiempo_de_intervalo.split(':').map(Number);
            fechaActual.add(horas, 'hours');
    fechaActual.add(minutos, 'minutes');
    fechaActual.add(segundos, 'seconds');
        }
        const ultima_fecha = fechasAdministracion[fechasAdministracion.length - 1];
        // Actualizar los registros de HistorialTratamiento
        const historialRecords = await HistorialNotas.findAll({
            where: {
                id_notas: nota.id_notas,
                id_paciente: nota.id_paciente,
            },
            order: [['fechas', 'ASC']]
        });

        console.log(`${historialRecords}`);


        if(historialRecords.length===0){
                fechasAdministracion.map(fecha => {
                HistorialNotas.create({
                    fechas: fecha,
                    id_notas: nota.id_notas,
                    id_paciente: nota.id_paciente,
                    ultima_fecha: ultima_fecha,
                });
            });
        }

        else{ // Actualizar los registros de HistorialTratamiento
            for (const historialItem of historialRecords) {
                await historialItem.destroy();
            }
            fechasAdministracion.map(fecha => {
                HistorialNotas.create({
                    fechas: fecha,
                    id_notas: nota.id_notas,
                    id_paciente: nota.id_paciente,
                    ultima_fecha: ultima_fecha,
                });
            });
        }
    }else if(nota.hora_programada !== req.body.hora_programada && req.body.recordatorio===true){
        const historialRecords = await HistorialNotas.findAll({
            where: {
                id_notas: nota.id_notas,
                id_paciente: nota.id_paciente,
            },
            order: [['fechas', 'ASC']]
        });

        if(historialRecords){
            for (const historialItem of historialRecords) {
                await historialItem.destroy();
            }}
    }
        nota.nombre_notas =
        req.body.nombre_notas ||nota.nombre_notas;
        nota.motivo =
        req.body.motivo || nota.motivo;
        nota.contenido =
        req.body.contenido || nota.contenido;
        nota.frecuencia = req.body.frecuencia !== 1 ? req.body.frecuencia : nota.frecuencia;
        nota.hora_programada =
        req.body.hora_programada || nota.hora_programada;
        nota.tiempo_de_intervalo =
        req.body.tiempo_de_intervalo || nota.tiempo_de_intervalo;
        nota.recordatorio=undefined ? nota.recordatorio : req.body.recordatorio;
        nota.recordatorio_continuo=undefined ? nota.recordatorio_continuo : req.body.recordatorio_continuo;
        nota.id_paciente=  req.body.id_paciente ||nota.id_paciente;
        nota.id_usuario=  req.body.id_usuario ||nota.id_usuario;
        await nota.save();

        res.status(200).json({ msg: 'Tratamiento actualizado exitosamente', success: true, data: nota });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar el tratamiento', success: false });
    }
};

export{
    crearNota,
    modificarNota,
    listarNotas,
    eliminarNota
}