import Paciente from '../models/paciente.js';
import Tratamiento from '../models/tratamiento.js'
import HistorialTratamiento from '../models/historialTratamiento.js';
import Configuracion from '../models/configuracion.js'

const listarPaciente = async (req, res) => {
    try {
        const data = await Paciente.findAll({
            where: {
                id_usuario: req.usuario.id_usuario
            }
        });
        return res.status(200).json({data:data});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al obtener los pacientes.', success: false });
    }
};

const crearPaciente = async (req, res) => {
    const paciente = new Paciente(req.body);
    paciente.id_usuario=req.usuario.id_usuario;
    if (!paciente.id_usuario) {
        console.log( req.usuario.id_usuario);
        return res.status(400).send('Debe proporcionar un id_usuario al crear un paciente');
    }
    const todosPaciente = await Paciente.findAll({ where: { id_usuario:req.usuario.id_usuario}});

    for(const pacientaExiste of todosPaciente ){
        if(pacientaExiste.nombre.toLowerCase().trim()===req.body.nombre.toLowerCase().trim()&&pacientaExiste.apellido.toLowerCase().trim()===req.body.apellido.toLowerCase().trim()&&pacientaExiste.apellido_segundo.toLowerCase().trim()===req.body.apellido_segundo.toLowerCase().trim()){
            const error = new Error("Esta Paciente ya exite, verifique");
            return res.status(404).json({ msg: error.message,success:false });
        
        }
    }
    try {
        const pacienteCreado = await paciente.save()
            return res.status(201).json({
                msg: "Creado Correctamente",
                success:true,
                pacienteCreado:pacienteCreado.id_paciente,
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al crear el paciente.' ,success:false});
    }
};

const eliminarPaciente = async (req, res) => {
    const { id_paciente } = req.params;
    const paciente =await Paciente.findOne({ where: { id_paciente } });

    if (!paciente) {
        return res.status(400).json({ msg: 'ID del paciente no encontrado.',success:false });
    }

    if (paciente.id_usuario.toString()!==req.usuario.id_usuario.toString()) {
        return res.json({ msg: 'Accion no valida',success:false });
    }

    const tratamiento = await Tratamiento.findAll({where:{id_paciente:paciente.id_paciente}})
    const historial = await HistorialTratamiento.findAll({where:{id_paciente:paciente.id_paciente}})
    const configuracion = await Configuracion.findOne({where:{id_paciente:paciente.id_paciente}})

    try {
        if(historial){
            for (const historialItem of historial) {
                await historialItem.destroy();
            }
        }
        if(configuracion){
            await configuracion.destroy();
        }
        if(tratamiento){
            for (const tratamientoItem of tratamiento) {
                await tratamientoItem.destroy();
            }
        }
        await paciente.destroy();
        return res.status(200).json({ msg: 'Paciente eliminado exitosamente.',success:true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al eliminar el paciente.',success:false });
    }
};


const modificarPaciente = async (req, res) => {
    const { id_paciente } = req.params;
    const paciente = await Paciente.findOne({ where: { id_paciente } });

    if (!id_paciente) {
        return res.status(400).json({ msg: 'ID del paciente no proporcionado.',success:false });
    }
    if (paciente.id_usuario.toString()!==req.usuario.id_usuario.toString()) {
        return res.json({ msg: 'Accion no valida',success:false });
    }
    paciente.nombre = req.body.nombre || paciente.nombre;
    paciente.apellido = req.body.apellido || paciente.apellido;
    paciente.fecha_nacimiento = req.body.fecha_nacimiento || paciente.fecha_nacimiento;
    paciente.afeccion = req.body.afeccion || paciente.afeccion;
    paciente.etapa_de_tratamiento = req.body.etapa_de_tratamiento || paciente.etapa_de_tratamiento;
    paciente.apellido_segundo = req.body.apellido_segundo || paciente.apellido_segundo;
    paciente.lente = req.body.lente === undefined ? paciente.lente : req.body.lente;
    paciente.parche = req.body.parche === undefined ? paciente.parche : req.body.parche;
    paciente.tipo_lente = req.body.tipo_lente || paciente.tipo_lente;
    paciente.tipo_parche = req.body.tipo_parche || paciente.tipo_parche;
    paciente.horas_parche = req.body.horas_parche || paciente.horas_parche;
    paciente.observaciones_parche = req.body.observaciones_parche || paciente.observaciones_parche;
    paciente.fecha_parche = req.body.fecha_parche || paciente.fecha_parche;
    paciente.graduacion_lente = req.body.graduacion_lente || paciente.graduacion_lente;
    paciente.fecha_lente = req.body.fecha_lente || paciente.fecha_lente;
    paciente.fecha_diagnostico = req.body.fecha_diagnostico || paciente.fecha_diagnostico;
    paciente.grado_miopia = req.body.grado_miopia || paciente.grado_miopia;
    paciente.examenes = req.body.examenes || paciente.examenes;
    paciente.recomendaciones = req.body.recomendaciones || paciente.recomendaciones;
    paciente.correcion_optica = req.body.correcion_optica || paciente.correcion_optica;
    paciente.ejercicios_visuales = req.body.ejercicios_visuales || paciente.ejercicios_visuales;
    paciente.cambio_optico = req.body.cambio_optico || paciente.cambio_optico;
    paciente.consejos_higiene = req.body.consejos_higiene || paciente.consejos_higiene;
    paciente.cirujia = req.body.cirujia || paciente.cirujia;
    paciente.cirujia_fecha = req.body.cirujia_fecha || paciente.cirujia_fecha;
    paciente.cirujia_resultados = req.body.cirujia_resultados || paciente.cirujia_resultados;
    paciente.progreso = req.body.progreso || paciente.progreso;
  
  try {
    await paciente.save();

    res.json({ msg: "Se ah actualizado Correctamente", paciente,success:true });
  } catch (error) {
    const err = new Error("Error al actualizar paciente");
    return res.status(500).json({ msg: err.message });
  }
};

export{  listarPaciente,
    crearPaciente,
    modificarPaciente,
    eliminarPaciente
};
