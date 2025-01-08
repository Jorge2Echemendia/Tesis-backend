import Configuracion from '../models/configuracion.js';
import Paciente from '../models/paciente.js';

const listarConfiguraciones = async (req, res) => {
    if (req.usuario.tipo_usuario !== "doctor") {
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ 
            msg: error.message,
            success: false,
            user: req.usuario
        });
    }
    try {
        const configuracion = await Configuracion.find({ id_paciente: null });
        return res.status(200).json(configuracion);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            msg: 'Error al obtener las configuraciones.', 
            success: false 
        });
    }
};

const crearConfiguracion = async(req, res) => {
    const { afeccion } = req.body;
    
    if (req.usuario.tipo_usuario !== "doctor") {
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ msg: error.message, success: false});
    }

    const configuracionExiste = await Configuracion.findOne({ afeccion,etapa });
  
    if (configuracionExiste) {
        const error = new Error("Esta Configuración ya existe, verifique");
        return res.status(404).json({ msg: error.message, success: false });
    }
  
    try {
        const configuracion = await Configuracion.create(req.body);
        return res.json({
            msg: `La Configuración ${configuracion.afeccion} fue creada correctamente`,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({ 
            msg: "Error al Crear una nueva configuración",
            success: false
        });
    }
};

const eliminarConfiguracion = async (req, res) => {
    const { id_configuracion } = req.params;
    const configuracion = await Configuracion.findById(id_configuracion);

    if (!configuracion) {
        return res.status(400).json({ 
            msg: 'ID de la Configuración no encontrado.',
            success: false 
        });
    }

    try {
        await configuracion.deleteOne();
        return res.status(200).json({ 
            msg: 'Configuración eliminada exitosamente.',
            success: true 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            msg: 'Error al eliminar la Configuración.',
            success: false 
        });
    }
};

const modificarConfiguracion = async (req, res) => {
    const { id_configuracion } = req.params;
    
    if (!id_configuracion) {
        return res.status(400).json({ 
            msg: 'ID de la Configuración no encontrado.',
            success: false 
        });
    }

    try {
        // Obtener la configuración actual antes de modificarla
        const configuracionActual = await Configuracion.findById(id_configuracion);
        if (!configuracionActual) {
            return res.status(404).json({ 
                msg: 'Configuración no encontrada',
                success: false 
            });
        }

        // Guardar los valores originales
        const valoresOriginales = {
            afeccion: configuracionActual.afeccion,
            tiempo_maximo_dia: configuracionActual.tiempo_maximo_dia,
            lente: configuracionActual.lente,
            parche: configuracionActual.parche,
            etapa: configuracionActual.etapa
        };

        console.log(valoresOriginales);

        // Modificar la configuración actual
        const configuracionActualizada = await Configuracion.findByIdAndUpdate(
            id_configuracion,
            {
                afeccion: req.body.afeccion,
                tiempo_maximo_dia: req.body.tiempo_maximo_dia,
                lente: req.body.lente === undefined ? undefined : req.body.lente,
                parche: req.body.parche === undefined ? undefined : req.body.parche,
                etapa: req.body.etapa
            },
            { new: true }
        );

        // Verificar si se actualizó correctamente
        if (!configuracionActualizada) {
            return res.status(404).json({ 
                msg: 'Configuración no encontrada',
                success: false 
            });
        }

        // Buscar otras configuraciones con atributos iguales y que tengan id_paciente
        const configuracionesSimilares = await Configuracion.find({
            afeccion: valoresOriginales.afeccion,
            tiempo_maximo_dia: valoresOriginales.tiempo_maximo_dia,
            lente: valoresOriginales.lente,
            parche: valoresOriginales.parche,
            etapa: valoresOriginales.etapa,
            id_paciente: { $ne: null } // Asegurarse de que tengan un id_paciente
        });

        // Actualizar las configuraciones similares
        await Promise.all(configuracionesSimilares.map(async (config) => {
            config.afeccion = req.body.afeccion || config.afeccion;
            config.tiempo_maximo_dia = req.body.tiempo_maximo_dia || config.tiempo_maximo_dia;
            config.lente = req.body.lente === undefined ? config.lente : req.body.lente;
            config.parche = req.body.parche === undefined ? config.parche : req.body.parche;
            config.etapa = req.body.etapa || config.etapa;

            await config.save();
        }));

        res.json({ 
            msg: "Se ha actualizado correctamente", 
            configuracion: configuracionActualizada,
            success: true 
        });
    } catch (error) {
        console.error('Error completo:', error);
        return res.status(500).json({ 
            msg: "Error al actualizar configuración",
            success: false 
        });
    }
};

const listarConfiguracion = async (req, res) => {
    if (req.usuario.tipo_usuario === "doctor") {
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ 
            msg: error.message,
            success: false,
            user: req.usuario
        });
    }

    const { id_paciente } = req.params;
    const paciente = await Paciente.findById(id_paciente);
    
    if (!paciente) {
        return res.status(404).json({ 
            msg: "Paciente no encontrado", 
            success: false 
        });
    }
    
    if (!paciente.afeccion) {
        return res.status(400).json({ 
            msg: "Paciente no encontrado o no tiene afección", 
            success: false 
        });
    }

    try {
        // Buscar configuración base según el tipo (lente o parche)
        let configuracionBase;
        if (paciente.lente === true) {
            configuracionBase = await Configuracion.findOne({
                afeccion: paciente.afeccion,
                etapa: paciente.etapa_de_tratamiento,
                lente: true
            });
        } else {
            configuracionBase = await Configuracion.findOne({
                afeccion: paciente.afeccion,
                etapa: paciente.etapa_de_tratamiento,
                parche: true
            });
        }

        if (!configuracionBase) {
            return res.status(404).json({ 
                msg: "Configuración no existente para el paciente", 
                success: false 
            });
        }

        // Buscar si el paciente ya tiene una configuración asignada
        const configuracionPerteneciente = await Configuracion.findOne({
            id_paciente: id_paciente
        });

        if (configuracionPerteneciente) {
            // Si ya tiene configuración, retornarla
            return res.json([configuracionPerteneciente]);
        }

        // Si la configuración base ya está asignada a otro paciente
        if (!configuracionBase.id_paciente) {
            // Crear una nueva configuración para este paciente
            const nuevaConfiguracion = new Configuracion({
                afeccion: configuracionBase.afeccion,
                tiempo_maximo_dia: configuracionBase.tiempo_maximo_dia,
                etapa: configuracionBase.etapa,
                lente: configuracionBase.lente,
                parche: configuracionBase.parche,
                id_paciente: paciente._id
            });

            await nuevaConfiguracion.save();
            console.log(`Nueva configuración creada para el paciente ${paciente._id}`);
            return res.json([nuevaConfiguracion]);
        } else {
            // Si la configuración base no está asignada, asignarla a este paciente
            configuracionBase.id_paciente = paciente._id;
            await configuracionBase.save();
            console.log(`Configuración base asignada al paciente ${paciente._id}`);
            return res.json([configuracionBase]);
        }

    } catch (error) {
        console.error('Error completo:', error);
        res.status(500).json({ 
            msg: 'Error al obtener las configuraciones por afección', 
            success: false,
            error: error.message 
        });
    }
};
export {
    crearConfiguracion,
    eliminarConfiguracion,
    listarConfiguracion,
    listarConfiguraciones,
    modificarConfiguracion
};

