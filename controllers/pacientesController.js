import Paciente from '../models/paciente.js';
import Tratamiento from '../models/tratamiento.js'
import HistorialTratamiento from '../models/historialTratamiento.js';
import Configuracion from '../models/configuracion.js'

const listarPaciente = async (req, res) => {
    try {
        const data = await Paciente.find({
            id_usuario: req.usuario._id
        });
        return res.status(200).json({data:data});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al obtener los pacientes.', success: false });
    }
};

const crearPaciente = async (req, res) => {
    if (!req.usuario._id) {
        console.log(req.usuario._id);
        return res.status(400).send('Debe proporcionar un id_usuario al crear un paciente');
    }

    const todosPaciente = await Paciente.find({ id_usuario: req.usuario._id });

    for(const pacientaExiste of todosPaciente ){
        if(pacientaExiste.nombre.toLowerCase().trim() === req.body.nombre.toLowerCase().trim() &&
           pacientaExiste.apellido.toLowerCase().trim() === req.body.apellido.toLowerCase().trim() &&
           pacientaExiste.apellido_segundo.toLowerCase().trim() === req.body.apellido_segundo.toLowerCase().trim()){
            const error = new Error("Este Paciente ya existe, verifique");
            return res.status(404).json({ msg: error.message, success:false });
        }
    }

    try {
        const pacienteData = {
            ...req.body,
            id_usuario: req.usuario._id
        };
        
        const pacienteCreado = await Paciente.create(pacienteData);
        return res.status(201).json({
            msg: "Creado Correctamente",
            success: true,
            pacienteCreado: pacienteCreado._id,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al crear el paciente.', success:false });
    }
};

const eliminarPaciente = async (req, res) => {
    const { id_paciente } = req.params;
    const paciente = await Paciente.findById(id_paciente);

    if (!paciente) {
        return res.status(400).json({ msg: 'ID del paciente no encontrado.', success:false });
    }

    if (paciente.id_usuario.toString() !== req.usuario._id.toString()) {
        return res.json({ msg: 'Accion no valida', success:false });
    }

    try {
        // Eliminar registros relacionados
        await HistorialTratamiento.deleteMany({ id_paciente: paciente._id });
        await Configuracion.deleteOne({ id_paciente: paciente._id });
        await Tratamiento.deleteMany({ id_paciente: paciente._id });
        
        // Eliminar paciente
        await Paciente.findByIdAndDelete(id_paciente);
        
        return res.status(200).json({ msg: 'Paciente eliminado exitosamente.', success:true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al eliminar el paciente.', success:false });
    }
};

const modificarPaciente = async (req, res) => {
    const { id_paciente } = req.params;
    
    if (!id_paciente) {
        return res.status(400).json({ msg: 'ID del paciente no proporcionado.', success:false });
    }

    const paciente = await Paciente.findById(id_paciente);

    if (!paciente) {
        return res.status(404).json({ msg: 'Paciente no encontrado.', success:false });
    }

    if (paciente.id_usuario.toString() !== req.usuario._id.toString()) {
        return res.json({ msg: 'Accion no valida', success:false });
    }

    try {
        const pacienteActualizado = await Paciente.findByIdAndUpdate(
            id_paciente,
            {
                nombre: req.body.nombre || paciente.nombre,
                apellido: req.body.apellido || paciente.apellido,
                fecha_nacimiento: req.body.fecha_nacimiento || paciente.fecha_nacimiento,
                afeccion: req.body.afeccion || paciente.afeccion,
                etapa_de_tratamiento: req.body.etapa_de_tratamiento || paciente.etapa_de_tratamiento,
                apellido_segundo: req.body.apellido_segundo || paciente.apellido_segundo,
                lente: req.body.lente === undefined ? paciente.lente : req.body.lente,
                parche: req.body.parche === undefined ? paciente.parche : req.body.parche,
                tipo_lente: req.body.tipo_lente || paciente.tipo_lente,
                tipo_parche: req.body.tipo_parche || paciente.tipo_parche,
                horas_parche: req.body.horas_parche || paciente.horas_parche,
                observaciones_parche: req.body.observaciones_parche || paciente.observaciones_parche,
                fecha_parche: req.body.fecha_parche || paciente.fecha_parche,
                graduacion_lente: req.body.graduacion_lente || paciente.graduacion_lente,
                fecha_lente: req.body.fecha_lente || paciente.fecha_lente,
                fecha_diagnostico: req.body.fecha_diagnostico || paciente.fecha_diagnostico,
                grado_miopia: req.body.grado_miopia || paciente.grado_miopia,
                examenes: req.body.examenes || paciente.examenes,
                recomendaciones: req.body.recomendaciones || paciente.recomendaciones,
                correcion_optica: req.body.correcion_optica || paciente.correcion_optica,
                ejercicios_visuales: req.body.ejercicios_visuales || paciente.ejercicios_visuales,
                cambio_optico: req.body.cambio_optico || paciente.cambio_optico,
                consejos_higiene: req.body.consejos_higiene || paciente.consejos_higiene,
                cirujia: req.body.cirujia || paciente.cirujia,
                cirujia_fecha: req.body.cirujia_fecha || paciente.cirujia_fecha,
                cirujia_resultados: req.body.cirujia_resultados || paciente.cirujia_resultados,
                progreso: req.body.progreso || paciente.progreso
            },
            { new: true }
        );

        res.json({ msg: "Se ha actualizado correctamente", paciente: pacienteActualizado, success:true });
    } catch (error) {
        const err = new Error("Error al actualizar paciente");
        return res.status(500).json({ msg: err.message });
    }
};

export {
    listarPaciente,
    crearPaciente,
    modificarPaciente,
    eliminarPaciente
};
