import { where } from 'sequelize';
import Configuracion from '../models/configuracion.js';
import Paciente from '../models/paciente.js';


const listarConfiguraciones = async (req, res) => {
    if (req.usuario.tipo_usuario !== "doctor") {
        console.log(`${req.usuario.tipo_usuario}`)
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ msg: error.message ,success:false,user:req.usuario});
        }
    try {
    const configuracion = await Configuracion.findAll({
        where:{
            id_paciente:null
        }
    });
    return res.status(200).json(configuracion);
} catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Error al obtener las configuraciones.', success: false });
}
};

const crearConfiguracion=async(req,res)=>{

    const { afeccion } = req.body;
    // Verificando que solo el administrador pueda crear tratamientos
    if (req.usuario.tipo_usuario !== "doctor") {
    const error = new Error("No tienes acceso a esta funcionalidad");
    return res.status(403).json({ msg: error.message ,success:false});
    }
    // Verificando si el Tratamiento
    const configuracionExiste = await Configuracion.findOne({ where: { afeccion } });
  
    if (configuracionExiste) {
      const error = new Error("Esta Configuracion ya exite, verifique");
      return res.status(404).json({ msg: error.message,success:false });
    }
  
    try {
      // Guardar un Tratamiento
      const configuracion = await Configuracion.create(req.body);

      return res.json({
        msg: `La Configuracion ${configuracion.afeccion} fue creado correctamente`,success:true,
      });
    } catch (error) {
      const err = new Error("Error al Crear una nuevo configuracion");
      return res.status(500).json({ msg: err.message ,success:false});
    }

};

const eliminarConfiguracion = async (req, res) => {
    const { id_configuracion } = req.params;
    const configuracion =await Configuracion.findOne({ where: { id_configuracion } });

    if (!configuracion) {
        return res.status(400).json({ msg: 'ID de la Configuracion no encontrado.',success:false });
    }

    try {
        await configuracion.destroy();
        return res.status(200).json({ msg: 'Configuracion eliminada exitosamente.',success:true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al eliminar la Configuracion.',success:false });
    }
};


const modificarConfiguracion = async (req, res) => {
    const { id_configuracion } = req.params;
    const configuracion = await Configuracion.findOne({ where: {id_configuracion: id_configuracion } });

    if (!id_configuracion) {
        return res.status(400).json({ msg: 'ID de la Configuracion no encontrado.',success:false });
    }
    configuracion.afeccion =
    req.body.afeccion ||configuracion.afeccion;
    configuracion.tiempo_maximo_dia =
    req.body.tiempo_maximo_dia || configuracion.tiempo_maximo_dia;
    configuracion.lente = req.body.lente === undefined ? configuracion.lente : req.body.lente;
    configuracion.parche = req.body.parche === undefined ? configuracion.parche : req.body.parche;
    configuracion.etapa=req.body.etapa || configuracion.etapa;

  try {
    await configuracion.save();

    res.json({ msg: "Se ah actualizado Correctamente", configuracion,success:true });
  } catch (error) {
    const err = new Error("Error al actualizar configuracion");
    return res.status(500).json({ msg: err.message });
  }
};

const listarConfiguracion = async (req, res) => {
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
        
        if (!paciente.afeccion) {
            return res.status(400).json({ msg: "'Paciente no encontrado o no tiene afección'", success: false });
        }
        try {
            if(paciente.lente===true){
        const configuracionLente = await Configuracion.findOne({
            where: {
                    afeccion:paciente.afeccion,
                    etapa:paciente.etapa_de_tratamiento,
                    lente:true
            }
        });
        if (!configuracionLente) {
            return res.status(404).json({ msg: "'Configuracion no encontrado'", success: false });
        }
            const configuracionperteneciente=await Configuracion.findOne({
            where: {
                id_paciente: id_paciente
            }});
        
            if ( configuracionperteneciente) {
                // El tratamiento existe y coincide con el paciente actual
                return res.json([configuracionperteneciente]);
            } else if (configuracionLente.id_paciente) {
                // El tratamiento existe pero no coincide con el paciente actual
                const nuevaConfiguracion = await Configuracion.create({
                    afeccion: configuracionLente.afeccion,
                    tiempo_maximo_dia: configuracionLente.tiempo_maximo_dia,
                    etapa:configuracionLente.etapa,
                    lente:configuracionLente.lente,
                    parche:configuracionLente.parche,
                    id_paciente: paciente.id_paciente,
                });
                return res.json([nuevaConfiguracion]);
            } else {
                // No hay tratamiento asociado al paciente
                configuracionLente.id_paciente = paciente.id_paciente;
                await configuracionLente.save();
                console.log(`Configuracion asignado al paciente ${paciente.id_paciente}`);
                return res.json([configuracionLente]);
            }
        }else{
            const configuracionParche = await Configuracion.findOne({
            where: {
                    afeccion:paciente.afeccion,
                    etapa:paciente.etapa_de_tratamiento,
                    parche:true
            }
        });
        if (!configuracionParche) {
            return res.status(404).json({ msg: "'Configuracion no encontrado'", success: false });
        }
            const configuracionperteneciente=await Configuracion.findOne({
            where: {
                id_paciente: id_paciente
            }});
        
            if ( configuracionperteneciente) {
                // El tratamiento existe y coincide con el paciente actual
                return res.json([configuracionperteneciente]);
            } else if (configuracionParche.id_paciente) {
                // El tratamiento existe pero no coincide con el paciente actual
                const nuevaConfiguracion = await Configuracion.create({
                    afeccion: configuracionParche.afeccion,
                    tiempo_maximo_dia: configuracionParche.tiempo_maximo_dia,
                    etapa:configuracionParche.etapa,
                    lente:configuracionParche.lente,
                    parche:configuracionParche.parche,
                    id_paciente: paciente.id_paciente,
                });
                return res.json([nuevaConfiguracion]);
            } else {
                // No hay tratamiento asociado al paciente
                configuracionParche.id_paciente = paciente.id_paciente;
                await configuracionParche.save();
                console.log(`Configuracion asignado al paciente ${paciente.id_paciente}`);
                return res.json([configuracionParche]);
            }
    }
        }catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener las configuraciones por aficción', success: false });
    }
};



export { crearConfiguracion, eliminarConfiguracion, listarConfiguracion, listarConfiguraciones, modificarConfiguracion };

