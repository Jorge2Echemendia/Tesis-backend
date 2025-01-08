import Usuario from '../models/user.js';
import HistorialTratamiento from '../models/historialTratamiento.js';
import Paciente from '../models/paciente.js';
import HistorialNotas from '../models/historialNotas.js';
import Notas from '../models/notas.js';

let adminInstance;

export const initNotifications = (admin) => {
  adminInstance = admin;
  
  setInterval(async () => {
    try {
      console.log('Revisando las notas y tratamientos para enviar notificaciones...');
      
      const { treatments, usuarios } = await getPendingTreatments();
      const { usuariosrecordatorios, usuarioscontinuos, continuo, notasrecordatorio, notascontinuas } = await getPendingNotas();
  
      if (notasrecordatorio.length > 0) {
        for (let i = 0; i < notasrecordatorio.length; i++) {
          await sendNotificationRecordatorio(notasrecordatorio[i], usuariosrecordatorios[i]);
        }
      }
  
      if (notascontinuas.length > 0) {
        for (let i = 0; i < notascontinuas.length; i++) {
          await sendNotificationContinua(notascontinuas[i], usuarioscontinuos[i], continuo[i]);
        }
      }
  
      if (treatments.length > 0) {
        for (let i = 0; i < treatments.length; i++) {
          await sendNotification(treatments[i], usuarios[i]);
        }
      }
  
      console.log('Revisión y envío de notificaciones completados.');
    } catch (error) {
      console.error('Error al revisar las notas y tratamientos:', error);
    }
  }, 60000);
};
  
async function getPendingTreatments() {
    const now = new Date();
    console.log(`${now}`);
  
    const fiveMinutesAgo = new Date(now.setHours(now.getHours() - 5, now.getMinutes() - 5, 0, 0));
    const fiveMinutesAhead = new Date(now.setHours(now.getHours(), now.getMinutes() + 5, 0, 0));
  
    const treatments = await HistorialTratamiento.find({
        fecha_administracion: fiveMinutesAhead
    }).sort('fecha_administracion');
  
    await HistorialTratamiento.deleteMany({
        ultima_fecha: { $lt: fiveMinutesAgo }
    });
  
    if (!treatments || treatments.length === 0) {
        console.log('No hay tratamientos pendientes para enviar notificaciones.');
    } else {
        console.log(`Hay ${treatments.length} tratamientos pendientes para enviar notificaciones.`);
    }
  
    const pacientes = await Promise.all(
        treatments.map(treatment => 
            Paciente.findById(treatment.id_paciente)
        )
    );
  
    const usuarios = await Promise.all(
        pacientes.map(paciente => 
            Usuario.findById(paciente.id_usuario)
        )
    );
  
    return { treatments, usuarios };
}
  
async function getPendingNotas() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.setHours(now.getHours() - 5, now.getMinutes() - 5, 0, 0));
    const fiveMinutesAhead = new Date(now.setHours(now.getHours(), now.getMinutes() + 5, 0, 0));
  
    const notascontinuas = await HistorialNotas.find({
        fechas: fiveMinutesAhead
    }).sort('fechas');
  
    const notasrecordatorio = await Notas.find({
        hora_programada: fiveMinutesAhead,
        recordatorio: true
    });
  
    await HistorialNotas.deleteMany({
        ultima_fecha: { $lt: fiveMinutesAgo }
    });
  
    const continuo = await Promise.all(
        notascontinuas.map(nota => 
            Notas.findById(nota.id_notas)
        )
    );
  
    const usuarioscontinuos = await Promise.all(
        continuo.map(nota => 
            Usuario.findById(nota.id_usuario)
        )
    );
  
    const usuariosrecordatorios = await Promise.all(
        notasrecordatorio.map(nota => 
            Usuario.findById(nota.id_usuario)
        )
    );
  
    return { 
        usuariosrecordatorios, 
        usuarioscontinuos, 
        continuo, 
        notasrecordatorio, 
        notascontinuas 
    };
}

async function sendNotification(treatment, usuario) {
    const token = usuario.notificacion_token;
    const message = {
        token: token,
        notification: {
            title: 'Hora del tratamiento',
            body: `Es la hora de tu tratamiento. Fecha y hora: ${treatment.fecha_administracion}`
        },
        data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
    };

    try {
        await adminInstance.messaging().send(message);
        console.log('Mensaje enviado exitosamente');
        return true;
    } catch (error) {
        console.error('Error al enviar notificación:', error.message || String(error));
        throw new Error(`Error al enviar mensaje: ${error.message || String(error)}`);
    }
}

async function sendNotificationRecordatorio(notasrecordatorio,usuariosrecordatorios) {
    const token = usuariosrecordatorios.notificacion_token;
    const message = {
        token: token,
        notification: {
            title: 'Notificación de nota programada',
            body: `Le recordamos su nota:${notasrecordatorio.nombre_notas}. Fecha y hora: ${notasrecordatorio.hora_programada}`
        },
        data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
    };
    try {
        await adminInstance.messaging().send(message);
        console.log('Mensaje enviado exitosamente');
        return true;
    } catch (error) {
        console.error('Error al enviar notificación:', error.message || String(error));
        throw new Error(`Error al enviar mensaje: ${error.message || String(error)}`);
    }
}

async function sendNotificationContinua(notascontinuas,usuarioscontinuos,continuo) {
    const token= usuarioscontinuos.notificacion_token;
    const message = {
        token: token,
        notification: {
            title:'Notificación de nota programada',
            body: `Le recordamos su nota:${continuo.nombre_notas}. Fecha y hora: ${notascontinuas.fechas}`
        },
        data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
    };

    try {
        await adminInstance.messaging().send(message);
        console.log('Mensaje enviado exitosamente');
        return true;
    } catch (error) {
        console.error('Error al enviar notificación:', error.message || String(error));
        throw new Error(`Error al enviar mensaje: ${error.message || String(error)}`);
    }
}
  
  
  
  
  
  