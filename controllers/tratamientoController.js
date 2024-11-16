
import { Op } from 'sequelize';
import HistorialTratamiento from "../models/historialTratamiento.js";
import Paciente from "../models/paciente.js";
import Tratamiento from "../models/tratamiento.js";


const crearTratamiento=async(req,res)=>{
    // Verificando que solo el administrador pueda crear tratamientos
    const {nombre_medicamento,nombre_tratamiento,descripcion,frecuencia,etapa,lente,parche,tiempo_de_la_medicacion}=req.body;
    if (req.usuario.tipo_usuario !== "doctor") {
      const error = new Error("No tienes acceso a esta funcionalidad");
      return res.status(403).json({ msg: error.message ,success:false});
    }
    const tratamiento = new Tratamiento({
        nombre_medicamento,
        nombre_tratamiento,
        descripcion,
        frecuencia,
        etapa,
        lente,
        parche,
        tiempo_de_la_medicacion,
        id_usuario:req.usuario.id_usuario
    });
    console.log(`${tratamiento.id_usuario}`);
    // Verificando si el Tratamiento
    const tratamientosExiste = await Tratamiento.findAll({ where:{
        nombre_tratamiento:req.body.nombre_medicamento,
        etapa:req.body.etapa
        } });

        for(tratamientoExiste of tratamientosExiste ){
            if (tratamientoExiste.nombre_medicamento.toLowerCase().trim()===req.body.toLowerCase().trim()) {
                const error = new Error("Esta Tratamiento ya exite, verifique");
                return res.status(404).json({ msg: error.message,success:false });
                }
        }
    try {
      // Guardar un Tratamiento
    const tratamientoCreado = await tratamiento.save()
    return res.status(201).json({
        msg: `El tratamiento ${tratamientoCreado.nombre_tratamiento} fue creado correctamente`,success:true,
      });
    } catch (error) {
      const err = new Error("Error al Crear un nuevo tratamento");
      console.log(err)
      return res.status(500).json({ msg: err.message ,success:false});
    }

};

const eliminarTratamiento=async(req,res)=>{
        const { id_tratamiento } = req.params;
        const tratamiento =await Tratamiento.findOne({ where: { id_tratamiento } });
    
        if (!tratamiento) {
            return res.status(400).json({ msg: 'ID del paciente no encontrado.',success:false });
        }

        const historial = await HistorialTratamiento.findAll({where:{id_tratamiento:tratamiento.id_tratamiento}})
        try {
            if(historial){
                for (const historialItem of historial) {
                    await historialItem.destroy();
                }}
            await tratamiento.destroy();
            return res.status(200).json({ msg: 'Paciente eliminado exitosamente.',success:true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: 'Error al eliminar el paciente.',success:false });
        }

};


const modificarTratamiento = async (req, res) => {
    const { id_tratamiento } = req.params;
    const tratamiento = await Tratamiento.findByPk(id_tratamiento);

    if (!tratamiento) {
        return res.status(404).json({ msg: 'Tratamiento no encontrado', success: false });
    }

    if (tratamiento.hora_programada !== req.body.hora_programada && tratamiento.id_usuario==null) {
        const nuevaHoraProgramada = new Date(req.body.hora_programada);

        // Actualizar los registros de HistorialTratamiento
        const historialRecords = await HistorialTratamiento.findAll({
            where: {
                id_tratamiento: tratamiento.id_tratamiento,
                id_paciente: tratamiento.id_paciente,
            },
            order: [['fecha_administracion', 'ASC']]
        });

        console.log(`${historialRecords}`);

        const fechasAdministracion = [];
        let fechaActual = nuevaHoraProgramada;

        // Calcular nuevas fechas de administración
        for (let i = 0; i < tratamiento.frecuencia; i++) {
            fechasAdministracion.push(new Date(fechaActual));
            const [horas, minutos, segundos] = tratamiento.tiempo_de_la_medicacion.split(':').map(Number);
            fechaActual.setHours(fechaActual.getHours() + horas, fechaActual.getMinutes() + minutos, fechaActual.getSeconds() + segundos);
        }

        // Actualizar los registros de HistorialTratamiento
        await Promise.all(historialRecords.map((record, index) => {
            return record.update({
                fecha_administracion: fechasAdministracion[index],
                ultima_fecha: fechasAdministracion[fechasAdministracion.length - 1],
            });
        }));
    }

    const tratamientopaciente=await Tratamiento.findAll({
        where:{
            nombre_medicamento:tratamiento.nombre_medicamento,
            etapa:tratamiento.etapa,
            nombre_tratamiento:tratamiento.nombre_tratamiento,
            id_usuario:null
        }
    })

    try {
        // Actualizar campos del tratamiento
        tratamiento.nombre_tratamiento =
        req.body.nombre_tratamiento ||tratamiento.nombre_tratamiento;
        tratamiento.nombre_medicamento =
        req.body.nombre_medicamento || tratamiento.nombre_medicamento;
        tratamiento.descripcion =
        req.body.descripcion || tratamiento.descripcion;
        tratamiento.frecuencia =
        req.body.frecuencia || tratamiento.frecuencia;
        tratamiento.hora_programada =
        req.body.hora_programada || tratamiento.hora_programada;
        tratamiento.tiempo_de_la_medicacion =
        req.body.tiempo_de_la_medicacion || tratamiento.tiempo_de_la_medicacion;
        tratamiento.etapa=req.body.etapa || tratamiento.etapa;
        tratamiento.lente = req.body.lente === undefined ? tratamiento.lente : req.body.lente;
        tratamiento.parche = req.body.parche === undefined ? tratamiento.parche : req.body.parche;
        tratamiento.id_paciente=  req.body.id_paciente ||tratamiento.id_paciente;
        tratamiento.id_usuario=  req.body.id_usuario ||tratamiento.id_usuario;


        await tratamiento.save();

        if(tratamientopaciente.length>0){
            for (let i = 0; i < tratamientopaciente.length; i++) {
                tratamientopaciente[i].set({
                    nombre_tratamiento: tratamiento.nombre_tratamiento,
                    nombre_medicamento: tratamiento.nombre_medicamento,
                    descripcion: tratamiento.descripcion,
                    frecuencia: tratamiento.frecuencia,
                    hora_programada: tratamientopaciente[i].hora_programada,
                    tiempo_de_la_medicacion: tratamiento.tiempo_de_la_medicacion,
                    etapa: tratamiento.etapa,
                    lente: tratamiento.lente,
                    parche: tratamiento.parche
                });
                await tratamientopaciente[i].save();
            }
        }

        res.status(200).json({ msg: 'Tratamiento actualizado exitosamente', success: true, data: tratamiento });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar el tratamiento', success: false });
    }
};

const listarTratamientoClientes = async (req, res) => {
    if (req.usuario.tipo_usuario === "doctor") {
        console.log(`${req.usuario.tipo_usuario}`)
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ msg: error.message ,success:false,user:req.usuario});
        }

        const id_paciente = req.params.id_paciente;
        const paciente = await Paciente.findOne({ where: { id_paciente: id_paciente } });
        
        if (!paciente) {
            return res.status(404).json({ msg: "'Paciente no encontrado'", success: false });
        }
        
        if (!paciente.afeccion && !paciente.etapa_de_tratamiento) {
            return res.status(400).json({ msg: "'Paciente no encontrado o no tiene afección ni etapa de tratamiento definida'", success: false });
        }
        try {
        if(paciente.lente===true){
        const tratamiento = await Tratamiento.findAll({
            where: {
                [Op.and]: [
                    { nombre_tratamiento: { [Op.iLike]: `%${paciente.afeccion.toLowerCase()}%` } },
                    { etapa: { [Op.iLike]: `%${paciente.etapa_de_tratamiento.toLowerCase()}%` } },
                    {lente:true},
                ]
            }
        });
        if (!tratamiento) {
            return res.status(404).json({ msg: "'Tratamiento no encontrado'", success: false });
        }
        const tratamientoperteneciente=await Tratamiento.findAll({
            where: {
                id_paciente: id_paciente
            }});
            console.log(`Tratamiento asignado al paciente ${tratamientoperteneciente.id_paciente}`);
            if (tratamientoperteneciente.length > 0) {
                if (tratamientoperteneciente.every(t => t.id_paciente === paciente.id_paciente)) {
                // El tratamiento existe y coincide con el paciente actual
                return res.json(tratamientoperteneciente);
            } }else if (tratamiento.some(t => t.id_paciente === null)) {
                // El tratamiento existe pero no coincide con el paciente actual
                const tratamientosVacios = tratamiento.filter(t => t.id_paciente === null);
                tratamientosVacios.forEach(t => {
                    t.id_paciente = paciente.id_paciente;
                });
                const nuevoTratamiento = await Tratamiento.bulkCreate(tratamientosVacios.map(t => ({
                    nombre_tratamiento: t.nombre_tratamiento,
                    nombre_medicamento: t.nombre_medicamento,
                    descripcion: t.descripcion,
                    frecuencia: t.frecuencia,
                    hora_programada: t.hora_programada,
                    tiempo_de_la_medicacion: t.tiempo_de_la_medicacion,
                    etapa: t.etapa,
                    lente: t.lente,
                    parche: t.parche,
                    id_paciente: paciente.id_paciente,
                })));
                
                return res.json(nuevoTratamiento);
                
            }
            }else{
                const tratamiento = await Tratamiento.findAll({
                    where: {
                        [Op.and]: [
                            { nombre_tratamiento: { [Op.iLike]: `%${paciente.afeccion.toLowerCase()}%` } },
                            { etapa: { [Op.iLike]: `%${paciente.etapa_de_tratamiento.toLowerCase()}%` } },
                            {parche:true}
                        ]
                    }
                });
                if (!tratamiento) {
                    return res.status(404).json({ msg: "'Tratamiento no encontrado'", success: false });
                }
                const tratamientoperteneciente=await Tratamiento.findAll({
                    where: {
                        id_paciente: id_paciente
                    }});
                    console.log(`Tratamiento asignado al paciente ${tratamientoperteneciente}`);
                
                    if (tratamientoperteneciente.length > 0) {
                        if (tratamientoperteneciente.every(t => t.id_paciente === paciente.id_paciente)) {
                        // El tratamiento existe y coincide con el paciente actual
                        return res.json(tratamientoperteneciente);
                      } }else if (tratamiento.some(t => t.id_paciente === null)) {
                        // El tratamiento existe pero no coincide con el paciente actual
                        const tratamientosVacios = tratamiento.filter(t => t.id_paciente === null);
                        tratamientosVacios.forEach(t => {
                            t.id_paciente = paciente.id_paciente;
                        });
                        const nuevoTratamiento = await Tratamiento.bulkCreate(tratamientosVacios.map(t => ({
                            nombre_tratamiento: t.nombre_tratamiento,
                            nombre_medicamento: t.nombre_medicamento,
                            descripcion: t.descripcion,
                            frecuencia: t.frecuencia,
                            hora_programada: t.hora_programada,
                            tiempo_de_la_medicacion: t.tiempo_de_la_medicacion,
                            etapa: t.etapa,
                            lente: t.lente,
                            parche: t.parche,
                            id_paciente: paciente.id_paciente,
                          })));
                        
                          return res.json(nuevoTratamiento);
                        
                    } 
            }
        } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los tratamientos por aficción', success: false });
    }
};


const listarTratamientotodoClientes=async(req,res)=>{
    if (req.usuario.tipo_usuario === "doctor") {
        console.log(`${req.usuario.tipo_usuario}`)
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ msg: error.message ,success:false,user:req.usuario});
        }
        const id_paciente = req.params.id_paciente;
        const paciente = await Paciente.findOne({ where: { id_paciente: id_paciente } });
        
        if (!paciente) {
            return res.status(404).json({ msg: "'Paciente no encontrado'", success: false });
        }
        
        if (!paciente.afeccion && !paciente.etapa_de_tratamiento) {
            return res.status(400).json({ msg: "'Paciente no encontrado o no tiene afección ni etapa de tratamiento definida'", success: false });
        }

        const tratamientoPaciente=await Tratamiento.findAll({
            where:{
                id_paciente:id_paciente
            }
        })

    try {
        if(paciente.lente===true){
            const tratamiento = await Tratamiento.findAll({
                where: {
                    [Op.and]: [
                        { nombre_tratamiento: { [Op.iLike]: `%${paciente.afeccion.toLowerCase()}%` } },
                        { etapa: { [Op.iLike]: `%${paciente.etapa_de_tratamiento.toLowerCase()}%` } },
                        {lente:true},
                        {id_paciente:null},
                    ]
                },
            });
            const filteredTratamientos = tratamiento.filter(t => 
                !tratamientoPaciente.find(tp => tp.nombre_medicamento === t.nombre_medicamento)
            );
            if (filteredTratamientos.length === 0) {
                return res.status(404).json({ msg: 'No hay nuevos tratamientos que coincidan con las caracteristicas del paciente.', success: false });
              }
            return res.json(filteredTratamientos);
        }else{
                const tratamiento = await Tratamiento.findAll({
                    where: {
                        [Op.and]: [
                            { nombre_tratamiento: { [Op.iLike]: `%${paciente.afeccion.toLowerCase()}%` } },
                            { etapa: { [Op.iLike]: `%${paciente.etapa_de_tratamiento.toLowerCase()}%` } },
                            {parche:true},
                            {id_paciente:null},
                        ]
                    },
                });
                const filteredTratamientos = tratamiento.filter(t => 
                    !tratamientoPaciente.find(tp => tp.nombre_medicamento === t.nombre_medicamento)
                );
                if (filteredTratamientos.length === 0) {
                    return res.status(404).json({ msg:  'No hay nuevos tratamientos que coincidan con las caracteristicas del paciente.', success: false });
                  }
                return res.json(filteredTratamientos);
            }
} catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Error al obtener los tratamientos.', success: false });
}

}



const listarTratamientoAd=async(req,res)=>{
    if (req.usuario.tipo_usuario !== "doctor") {
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ msg: error.message ,success:false,user:req.usuario});
        }
    try {
    const tratamientos = await Tratamiento.findAll({
        where:{
            id_paciente:[]
        }});
    return res.status(200).json(tratamientos);
} catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Error al obtener los tratamientos.', success: false });
}

}

const asignarIDPaciente=async(req,res)=>{
    if (req.usuario.tipo_usuario === "doctor") {
        console.log(`${req.usuario.tipo_usuario}`)
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ msg: error.message ,success:false,user:req.usuario});
        }
        const id_paciente = req.params.id_paciente;
        const id_tratamiento=req.params.id_tratamiento;
        console.log(`${id_tratamiento}`);

  try {
    const tratamiento = await Tratamiento.findOne({
      where: {
        id_tratamiento: id_tratamiento
      }
    });

    if (!tratamiento) {
      return res.status(404).json({ msg: 'Tratamiento no encontrado', success: false });
    }

    const nuevoTratamiento = await Tratamiento.create({
      nombre_tratamiento: tratamiento.nombre_tratamiento,
      nombre_medicamento: tratamiento.nombre_medicamento,
      descripcion: tratamiento.descripcion,
      frecuencia: tratamiento.frecuencia,
      hora_programada: tratamiento.hora_programada,
      tiempo_de_la_medicacion: tratamiento.tiempo_de_la_medicacion,
      etapa: tratamiento.etapa,
      lente: tratamiento.lente,
      parche: tratamiento.parche,
      id_paciente: id_paciente,
    });

    return res.json(nuevoTratamiento);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Error al asignar el tratamiento al paciente', success: false });
  }
};


export {
    asignarIDPaciente, crearTratamiento,
    eliminarTratamiento, listarTratamientoAd, listarTratamientoClientes, listarTratamientotodoClientes, modificarTratamiento
};

