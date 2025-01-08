import HistorialTratamiento from "../models/historialTratamiento.js";
import Paciente from "../models/paciente.js";
import Tratamiento from "../models/tratamiento.js";

const crearTratamiento = async(req, res) => {
    const {nombre_medicamento, nombre_tratamiento, descripcion, frecuencia, etapa, lente, parche, tiempo_de_la_medicacion} = req.body;
    
    if (req.usuario.tipo_usuario !== "doctor") {
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ msg: error.message, success: false});
    }

    // Verificando si el Tratamiento existe
    const tratamientosExiste = await Tratamiento.find({
        nombre_tratamiento: req.body.nombre_medicamento,
        etapa: req.body.etapa
    });

    for(const tratamientoExiste of tratamientosExiste) {
        if (tratamientoExiste.nombre_medicamento.toLowerCase().trim() === req.body.toLowerCase().trim()) {
            const error = new Error("Este Tratamiento ya existe, verifique");
            return res.status(404).json({ msg: error.message, success: false });
        }
    }

    try {
        const tratamientoCreado = await Tratamiento.create({
            nombre_medicamento,
            nombre_tratamiento,
            descripcion,
            frecuencia,
            etapa,
            lente,
            parche,
            tiempo_de_la_medicacion,
            id_usuario: req.usuario._id
        });

        return res.status(201).json({
            msg: `El tratamiento ${tratamientoCreado.nombre_tratamiento} fue creado correctamente`,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Error al Crear un nuevo tratamiento", success: false});
    }
};

const eliminarTratamiento = async(req, res) => {
    const { id_tratamiento } = req.params;
    const tratamiento = await Tratamiento.findById(id_tratamiento);

    if (!tratamiento) {
        return res.status(400).json({ msg: 'ID del tratamiento no encontrado.', success: false });
    }

    try {
        await HistorialTratamiento.deleteMany({ id_tratamiento: tratamiento._id });
        await Tratamiento.findByIdAndDelete(id_tratamiento);
        return res.status(200).json({ msg: 'Tratamiento eliminado exitosamente.', success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al eliminar el tratamiento.', success: false });
    }
};

const modificarTratamiento = async (req, res) => {
    try {
        const { id_tratamiento } = req.params;
        const tratamiento = await Tratamiento.findById(id_tratamiento);

        console.log('==== DATOS DEL TRATAMIENTO ====');
        console.log('Tratamiento encontrado:', {
            id: tratamiento._id,
            frecuencia: tratamiento.frecuencia,
            hora_programada: tratamiento.hora_programada,
            tiempo_medicacion: tratamiento.tiempo_de_la_medicacion
        });

        console.log('==== DATOS DE LA PETICIÓN ====');
        console.log('Nueva hora programada:', req.body.hora_programada);
        console.log('Frecuencia actual:', tratamiento.frecuencia);
        
        if (tratamiento.hora_programada !== req.body.hora_programada && !tratamiento.id_usuario) {
            const nuevaHoraProgramada = new Date(req.body.hora_programada);
            const fechasAdministracion = [];
            
            console.log('==== CÁLCULO DE FECHAS ====');
            
            // Iniciar con la primera fecha
            let fechaActual = new Date(nuevaHoraProgramada);
            
            for (let i = 0; i < tratamiento.frecuencia; i++) {
                // Guardar la fecha actual
                fechasAdministracion.push(new Date(fechaActual));
                
                // Obtener los valores de tiempo
                const [horas, minutos] = tratamiento.tiempo_de_la_medicacion.split(':').map(Number);
                
                console.log(`Antes de modificar - Iteración ${i + 1}:`, {
                    fecha: fechaActual.toISOString(),
                    horas,
                    minutos
                });
                
                // Crear una nueva fecha para la siguiente iteración
                const siguienteFecha = new Date(fechaActual.getTime());
                siguienteFecha.setHours(siguienteFecha.getHours() + horas);
                siguienteFecha.setMinutes(siguienteFecha.getMinutes() + minutos);
                
                // Actualizar fechaActual con la nueva fecha
                fechaActual = siguienteFecha;
                
                console.log(`Después de modificar - Iteración ${i + 1}:`, {
                    fecha: fechaActual.toISOString()
                });
            }

            console.log('==== FECHAS GENERADAS ====');
            console.log('Fechas:', fechasAdministracion.map(f => f.toISOString()));

            // Verificar que todas las fechas sean válidas
            if (fechasAdministracion.some(fecha => isNaN(fecha.getTime()))) {
                throw new Error('Se generaron fechas inválidas');
            }

            const historialRecords = await HistorialTratamiento.find({
                id_tratamiento: tratamiento._id,
                id_paciente: tratamiento.id_paciente
            }).sort({ fecha_administracion: 1 });

            if (historialRecords.length === 0) {
                const nuevosRegistros = fechasAdministracion.map(fecha => ({
                    fecha_administracion: fecha,
                    id_tratamiento: tratamiento._id,
                    id_paciente: tratamiento.id_paciente,
                    ultima_fecha: fechasAdministracion[fechasAdministracion.length - 1]
                }));

                await HistorialTratamiento.insertMany(nuevosRegistros);
            } else {
                await Promise.all(historialRecords.map(async (record, index) => {
                    if (fechasAdministracion[index]) {
                        await HistorialTratamiento.findByIdAndUpdate(record._id, {
                            fecha_administracion: fechasAdministracion[index],
                            ultima_fecha: fechasAdministracion[fechasAdministracion.length - 1]
                        });
                    }
                }));
            }
        }

        // Buscar tratamientos relacionados antes de actualizar
        const tratamientosPaciente = await Tratamiento.find({
            nombre_medicamento: tratamiento.nombre_medicamento,
            etapa: tratamiento.etapa,
            nombre_tratamiento: tratamiento.nombre_tratamiento,
            id_usuario: null
        });

        // Actualizar el tratamiento principal
        const tratamientoActualizado = await Tratamiento.findByIdAndUpdate(
            id_tratamiento,
            {
                $set: {
                    nombre_tratamiento: req.body.nombre_tratamiento || tratamiento.nombre_tratamiento,
                    nombre_medicamento: req.body.nombre_medicamento || tratamiento.nombre_medicamento,
                    descripcion: req.body.descripcion || tratamiento.descripcion,
                    frecuencia: req.body.frecuencia || tratamiento.frecuencia,
                    hora_programada: req.body.hora_programada || tratamiento.hora_programada,
                    tiempo_de_la_medicacion: req.body.tiempo_de_la_medicacion || tratamiento.tiempo_de_la_medicacion,
                    etapa: req.body.etapa || tratamiento.etapa,
                    lente: req.body.lente === undefined ? tratamiento.lente : req.body.lente,
                    parche: req.body.parche === undefined ? tratamiento.parche : req.body.parche,
                    id_paciente: req.body.id_paciente || tratamiento.id_paciente,
                    id_usuario: req.body.id_usuario || tratamiento.id_usuario
                }
            },
            { new: true }
        );

        // Actualizar tratamientos relacionados
        if (tratamientosPaciente.length > 0) {
            await Promise.all(tratamientosPaciente.map(t => 
                Tratamiento.findByIdAndUpdate(t._id, {
                    $set: {
                        nombre_tratamiento: tratamientoActualizado.nombre_tratamiento,
                        nombre_medicamento: tratamientoActualizado.nombre_medicamento,
                        descripcion: tratamientoActualizado.descripcion,
                        frecuencia: tratamientoActualizado.frecuencia,
                        tiempo_de_la_medicacion: tratamientoActualizado.tiempo_de_la_medicacion,
                        etapa: tratamientoActualizado.etapa,
                        lente: tratamientoActualizado.lente,
                        parche: tratamientoActualizado.parche
                    }
                })
            ));
        }

        res.status(200).json({
            msg: 'Tratamiento actualizado exitosamente',
            success: true,
            data: tratamientoActualizado
        });

    } catch (error) {
        console.error('Error completo:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            msg: 'Error al modificar el tratamiento',
            success: false,
            error: error.message
        });
    }
};

const listarTratamientotodoClientes = async(req, res) => {
    if (req.usuario.tipo_usuario === "doctor") {
        console.log(`${req.usuario.tipo_usuario}`);
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ msg: error.message, success: false, user: req.usuario});
    }

    const id_paciente = req.params.id_paciente;
    const paciente = await Paciente.findById(id_paciente);
    
    if (!paciente) {
        return res.status(404).json({ msg: "Paciente no encontrado", success: false });
    }
    
    if (!paciente.afeccion && !paciente.etapa_de_tratamiento) {
        return res.status(400).json({ 
            msg: "Paciente no encontrado o no tiene afección ni etapa de tratamiento definida", 
            success: false 
        });
    }

    const tratamientoPaciente = await Tratamiento.find({ id_paciente });

    try {
        if(paciente.lente === true) {
            const tratamiento = await Tratamiento.find({
                $and: [
                    { nombre_tratamiento: { $regex: paciente.afeccion.toLowerCase(), $options: 'i' } },
                    { etapa: { $regex: paciente.etapa_de_tratamiento.toLowerCase(), $options: 'i' } },
                    { lente: true },
                    { id_paciente: null }
                ]
            });

            const filteredTratamientos = tratamiento.filter(t => 
                !tratamientoPaciente.find(tp => tp.nombre_medicamento === t.nombre_medicamento)
            );

            if (filteredTratamientos.length === 0) {
                return res.status(404).json({ 
                    msg: 'No hay nuevos tratamientos que coincidan con las características del paciente.', 
                    success: false 
                });
            }
            return res.json(filteredTratamientos);
        } else {
            const tratamiento = await Tratamiento.find({
                $and: [
                    { nombre_tratamiento: { $regex: paciente.afeccion.toLowerCase(), $options: 'i' } },
                    { etapa: { $regex: paciente.etapa_de_tratamiento.toLowerCase(), $options: 'i' } },
                    { parche: true },
                    { id_paciente: null }
                ]
            });

            const filteredTratamientos = tratamiento.filter(t => 
                !tratamientoPaciente.find(tp => tp.nombre_medicamento === t.nombre_medicamento)
            );

            if (filteredTratamientos.length === 0) {
                return res.status(404).json({ 
                    msg: 'No hay nuevos tratamientos que coincidan con las características del paciente.', 
                    success: false 
                });
            }
            return res.json(filteredTratamientos);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al obtener los tratamientos.', success: false });
    }
};

const listarTratamientoAd = async(req, res) => {
    if (req.usuario.tipo_usuario !== "doctor") {
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ msg: error.message, success: false, user: req.usuario});
    }

    try {
        const tratamientos = await Tratamiento.find({ id_paciente: null });
        return res.status(200).json(tratamientos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al obtener los tratamientos.', success: false });
    }
};

const asignarIDPaciente = async(req, res) => {
    if (req.usuario.tipo_usuario === "doctor") {
        console.log(`${req.usuario.tipo_usuario}`);
        const error = new Error("No tienes acceso a esta funcionalidad");
        return res.status(403).json({ msg: error.message, success: false, user: req.usuario});
    }

    const id_paciente = req.params.id_paciente;
    const id_tratamiento = req.params.id_tratamiento;

    try {
        const tratamiento = await Tratamiento.findById(id_tratamiento);

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
        return res.status(500).json({ 
            msg: 'Error al asignar el tratamiento al paciente', 
            success: false 
        });
    }
};

const listarTratamientoClientes = async (req, res) => {
    try {
        if (req.usuario.tipo_usuario === "doctor") {
            console.log(`${req.usuario.tipo_usuario}`);
            const error = new Error("No tienes acceso a esta funcionalidad");
            return res.status(403).json({ msg: error.message, success: false, user: req.usuario });
        }

        const id_paciente = req.params.id_paciente;
        const paciente = await Paciente.findById(id_paciente);

        if (!paciente) {
            return res.status(404).json({ msg: "Paciente no encontrado", success: false });
        }

        if (!paciente.afeccion && !paciente.etapa_de_tratamiento) {
            return res.status(400).json({ 
                msg: "Paciente no encontrado o no tiene afección ni etapa de tratamiento definida", 
                success: false 
            });
        }

        // Primero verificar si el paciente ya tiene tratamientos asignados
        const tratamientoperteneciente = await Tratamiento.find({ id_paciente });
        console.log(`Tratamiento asignado al paciente:`, tratamientoperteneciente);

        if (tratamientoperteneciente.length > 0) {
            return res.json(tratamientoperteneciente);
        }

        // Si no tiene tratamientos, buscar tratamientos base según su condición
        let queryConditions = {
            $and: [
                { 
                    nombre_tratamiento: { 
                        $regex: paciente.afeccion.toLowerCase(), 
                        $options: 'i' 
                    } 
                },
                { 
                    etapa: { 
                        $regex: paciente.etapa_de_tratamiento.toLowerCase(), 
                        $options: 'i' 
                    } 
                },
                paciente.lente ? { lente: true } : { parche: true }
            ]
        };

        const tratamientosBase = await Tratamiento.find(queryConditions);

        if (tratamientosBase.length === 0) {
            return res.status(404).json({ 
                msg: "Tratamiento no encontrado para el paciente", 
                success: false 
            });
        }

        // Filtrar solo los tratamientos que no están asignados
        const tratamientosVacios = tratamientosBase.filter(t => t.id_paciente === null);

        if (tratamientosVacios.length === 0) {
            return res.status(404).json({ 
                msg: "No hay tratamientos disponibles para asignar", 
                success: false 
            });
        }

        // Crear nuevos tratamientos para el paciente
        const nuevosTratamientos = await Tratamiento.insertMany(
            tratamientosVacios.map(t => ({
                nombre_tratamiento: t.nombre_tratamiento,
                nombre_medicamento: t.nombre_medicamento,
                descripcion: t.descripcion,
                frecuencia: t.frecuencia,
                hora_programada: t.hora_programada,
                tiempo_de_la_medicacion: t.tiempo_de_la_medicacion,
                etapa: t.etapa,
                lente: t.lente,
                parche: t.parche,
                id_paciente: paciente._id
            }))
        );

        return res.json(nuevosTratamientos);

    } catch (error) {
        console.error('Error completo:', error);
        return res.status(500).json({ 
            msg: 'Error al obtener los tratamientos por afección', 
            success: false,
            error: error.message 
        });
    }
};
export {
    asignarIDPaciente,
    crearTratamiento,
    eliminarTratamiento,
    listarTratamientoAd,
    listarTratamientoClientes,
    listarTratamientotodoClientes,
    modificarTratamiento
};

