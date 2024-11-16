
  import express from 'express';
  import cors from 'cors';
  import dotenv from "dotenv";
  import { createServer } from 'http';
  import logger from 'morgan';
  import db from "./config/db.js";
  import userRoutes from './routes/userRoutes.js';
  import pacienteRoutes from './routes/pacienteRoutes.js';
  import tratamientoRoutes from './routes/tratamientoRoutes.js';
  import configuracionRoutes from './routes/configuracionRoutes.js';
  import historialtratamientosRoutes from './routes/historialtratamientosRoutes.js';
  import notasRoutes from './routes/notasRoutes.js';
  import Usuario from './models/user.js';
  import HistorialTratamiento from './models/historialTratamiento.js';
  import admin from 'firebase-admin';
  import fs from 'fs';
  import path from 'path';
  import { fileURLToPath } from 'url';
  import Paciente from './models/paciente.js';
  import { Op } from 'sequelize';
import HistorialNotas from './models/historialNotas.js';
import Notas from './models/notas.js';


  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  async function initFirebaseAdmin() {
    //const serviceAccountJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8'));
    const serviceAccountJson = {
      type: "service_account",
      project_id: "tesis-f0a5e",
      private_key_id: "69fb47b4aa63eb7fb7b656374db8506a322eeb2b",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCn+iSiMTI3SKoz\nyJ1/0HQsnDpGEULYzw2kwgwa2r60jRYwo803knIlLUG549Bc7fimrrOXyNWCcNZb\nnuEVMvvnThQhxE63XHSo31pjGHZyS8M/ur4fd8NsKuk1hNuKqKNuuLGUN9z6Nj35\nfqQDhFxbxDXLPSl6vjBEmCmfqmJL0Dp/pFJyON9oDtowhmEdgGHP/QBQl9TuW5/u\njMa2fLfgM2ovLdc4Ln7lhz/gW/DrGzelQrl2yM0+V42hDuB87ccAEEDK6yL/LOrq\n80zpdMFPsthlSrRyLWfYX8+ImeRpcaBR3jZA5UhsvIFJNrmF8nhINtMKvSAX2LRP\nyB6ITeilAgMBAAECggEAD+peBTYXFXDfm4dzENSt5ToqNVBWXpeDqewu3G6EajQB\n+brTa2QHR6l5lETXDa8Ig7aC0qtXO4Q4czbjCbCqeHiH5MkmUi5C6Ws8M65yLpMq\nHUQy1mVxETMhpI4BhSpETe3W+X2vhM+V4KlUnfaxD4rQNAEICJazmRQ3wWaR6K/b\nIhk8E3mxoHG+R+WgqrCeCgJcUmY2XFEks0GiEr3o+bzX0uxjGi18OnW54y2rI8Rv\neTbzxa2disxmsTNEm3aT71OSTfeAccdvJZOM8gOKFJARfx551JIa+hZ2GQ7LVxic\n1cu5GXs5ghVoC9YpSZeDC91O0ihhiYCjOrsr4XHYAQKBgQDh93UyFZulGumE0bM9\nHQ2d4XnKKrab0lsRcNFqzLmVpeyDPLC5qFQh2w4kUobvLf+Oi67SYkq/jXhLx5Zp\nZUETX0fbnU+p3qDHP4UTRVPjZC7yvW8T57SPjA8ZymNOh+lULJ7YYL/08a7Dpi0I\nfWeWF7I7NXHkSo5PM4ql81TUpQKBgQC+TZXLoZ4HB5naTTQ1E8rw1+yYVx/LkVBZ\n3mqaIUvAY7e9AhrpTchpsy0sa3zPDXToS4HDZH+R3mOjU7Cqbm31SUckiEtfWT1g\nv0s+NvWi5iuQwuIp6Gkn8OWIRMh40gMoPYxssDS0SjlALDEpUuIil2gD2YguDrX8\n/x4ClcSEAQKBgDu7WjN/GsGuN4RwmlzRTUQq0jLqz5KpLIGTvQfqTjSMw9R9OooZ\nQQQiD77yQdD/68oWioP6j5/LGb2OaOg7Z9RjH2+iSeixfPauh9LsRJybYv2vrakp\nWsWHVIaQxWeA7eDeWq8ABD4PlQ8K4mSYIcW/RdH48r5SJwQwr7nmdMoxAoGBAI9N\nj1qbJov2nlW0Q3cgo3a/sot5OBksIQy7nxzXq9qBfNAYsLk0+JEX+xFzE7Y7VOjE\nS0AfAq2OgQtxrxx4Mdc+yhLpi5COe9jJ1FhSPKDhoLbO+k5ClEUec0otOaU5yGTa\nDE+gVN/a8MexP4f1wRH5X7teaNz9+O8+EZQywZwBAoGBANI/baBZJRsHRkzDZkYa\nMW4R4cMWpbNcC/FR8wsPw8WOchuZfELgEj/v55kPuSOz++Wl9wN1mNNBwybRTMiZ\nnOPXad14syBeCnYIXkz9dkDuNoj/eqF0P8mlTDdkPk32cu6FSwrfUzmMXfy/f0Bw\nIlCSpZkvxvGDBGkrou0WvnNM\n-----END PRIVATE KEY-----\n",
      client_email: "firebase-adminsdk-ae77y@tesis-f0a5e.iam.gserviceaccount.com",
      client_id: "116365173034087013690",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ae77y%40tesis-f0a5e.iam.gserviceaccount.com",
      universe_domain: "googleapis.com"
    }
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
        serviceAccount: {
          type: 'service_account',
          project_id: 'tesis-f0a5e',
          private_key_id: 'd357cf49e5f65ba1a1038ba33389685b35d488a9',
          private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCZ/L1g9Gt6BeoC\n+VtkhRPUG4gNDf5K/kCLLNWoXTyblo2flBdfqMON+u5Le+PP6qDRqxijpPLO9TRB\nj5UyufGPkxS0Lxi3mCn5pmyiTY5prqXNXUpwqvn7B4vsdxIDWE8aPywqMQJC+sCm\nICTJM02ZlrbLcleQcgepL+r+2Yd30U8fImT2GlkckKhqDCeM36k2x9bvlJbgR5ta\ndduE0sKeejxShiQ49YBnlR/tTz+GA6k2JuY2vRGPIgW68qd17vu0YMcqk8FY9iBu\nxtFTmt5RGG01GZITIBmgXkRTM98DsHJ188lyP5pCtQjLMYMJWqYpRZYk+xk8VACr\nWupOh4K5AgMBAAECggEABYssKLNH8sHHf9GpFQR29ygCFQE71kiSu4fyza/EnK/V\n+6id0k1ts9z0qv5D8HJolX/IwGxx6to4RkN0ajn4PLRddpKq+8IUQcb4anvrDHoz\ngSISid2X6A4InyvWt8zcNSxQy1iOFan4GUr3NBCfIrBCtq6QQTSfurstRT1A06ME\nvsaS1cAHvB47XNMDpHZ4m5DBrNIKJGsySCLOgNiWaeIvSHV2PzOgQqcZRQ45KMVR\n+bESndEOEzxUXJozozc1qFuKEoqYlIJeihrXWdsQZTImUBA+xDJjttA4gfMfUUf4\nvnpncI04TN0J/GvUapH8MBPG/2uWrOydjgo7usbG8QKBgQDLYGIi2mSIr23JTQOW\no3S5brUJbDUBHO2ISt3hqN6SWHq2scPjIBmgC/wQQjfEpk7wwe7DoYWm5wZ1QmCZ\nptDTwAzFNUq7ejAZoavZskPpq/q9QerGfWMIaK4EH+od03bgqfwLta6ZYf5c6ctZ\noM6aZSJ4SfMIrRup8L/LtSRPqQKBgQDB1NLvmNe8lMw71kMRB5G+/eRrLHdPgv/w\n0bXFrf4reaz8tVWUV5Lz5hqmUm6EWt98HH034AZDR3SDTwws7myMxhkSIUPbGEyi\nGW/SWf6Q5vj8MOo2Zi8BYZPseLdT2smvseI9QomBcfZybqnKXs5XMkIdAb6HnQJV\nYgW8R9HEkQKBgQCw8XOQdUhAr7iqCipUFnSInOw/fXiENmHnUZPIMH8s/nQNnY4b\nfqMs3yB4GNSicDuANoqAhHhe5ON2g8C+DifkA1RZA+u4Py+4LTPyHKn/lNR7cu1L\nsm3GNCUqi4XKW2AzSVFz8qcs5dhDiFmW6lS2ecVKuLQNWWcXLNIB7uDfuQKBgCmo\nWNE/sxYHkMFHclCFpPA8Vswl2VqQV/tkxsE+fMLROrlxK3xfOekLSiz2yGPPt/pP\nkSXiEtaA0+yon4BEmbXDmX3JAnFjDo1EFEFMMCbqTRa+WIfqfC26z/ThmNz/x5ro\nCyyJUU4ttP6xA/LHX2dkGMttJYq11tuM3pixgsbRAoGAbuL5vK+crODanQxPMzNO\nmYEN6v9TJwMR+fL5iQ+fokCFAHJlUhYbvrMl8HfUgPi+A+c9ZulXx32dsmUEpJdM\n6zRcF2KLXOzmkpyfkUmExhfiKF1QoXj9wqDS6+IskjzTgNrOWldPoH1ilswIQHy8\niRBMcVYbTeHTfGw3Nb4DdX8=\n-----END PRIVATE KEY-----\n",
          client_email: 'aplicacion-tesis@tesis-f0a5e.iam.gserviceaccount.com',
          client_id: '101653246232881824194',
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/aplicacion-tesis%40tesis-f0a5e.iam.gserviceaccount.com',
          universe_domain: 'googleapis.com'
        }
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
    }
  }

  initFirebaseAdmin();


  const PORT = process.env.PORT || 3000;
  const app = express();
  const server = createServer(app);

  app.use(logger('dev'));

  app.use(express.json());
  app.use(express.urlencoded({
      extended:true 
  }));

  app.disable('x-powered-by');

  app.set('port',PORT);


  dotenv.config();
  // Prueba la conexión a la base de datos
  db.authenticate()
    .then(() => console.log("Conexión a la base de datos establecida con éxito."))
    .catch((err) =>
      console.error("No se pudo conectar a la base de datos:", err)
    );
  const dominiosPermitidos = ["http://192.168.43.105:3000"];
    const corsOptions = {
      origin: function(origin, callback){
        if(dominiosPermitidos.indexOf(origin) !== -1){
          //El origen del Requet esta permitido
          callback(null,true);
      }else{
        callback(new Error('No permitido por CORS'))
      }
    }
  }
  app.use(cors());
  app.use("/usuario", userRoutes);
  app.use("/paciente", pacienteRoutes);
  app.use("/tratamiento", tratamientoRoutes);
  app.use("/historialtratamientos", historialtratamientosRoutes);
  app.use("/configuracion", configuracionRoutes);
  app.use("/notas", notasRoutes);



  server.listen(PORT, '192.168.43.105', () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error interno del servidor',err);
  });

  console.log(`Username: ${process.env.DB_USER}, Password: ${process.env.DB_PASS}`);

  // Usar setInterval para revisar los tratamientos cada minuto
// Eliminamos el segundo intervalo y usamos solo uno para revisar y enviar todas las notificaciones

setInterval(async () => {
  try {
    console.log('Revisando las notas y tratamientos para enviar notificaciones...');
    
    // Obtenemos los tratamientos pendientes
    const { treatments, usuarios } = await getPendingTreatments();
    
    // Obtenemos las notas pendientes
    const { usuariosrecordatorios, usuarioscontinuos, continuo, notasrecordatorio, notascontinuas } = await getPendingNotas();

    // Enviar notificaciones de recordatorio
    if (notasrecordatorio.length > 0) {
      for (let i = 0; i < notasrecordatorio.length; i++) {
        await sendNotificationRecordatorio(notasrecordatorio[i], usuariosrecordatorios[i]);
      }
    }

    // Enviar notificaciones continuas
    if (notascontinuas.length > 0) {
      for (let i = 0; i < notascontinuas.length; i++) {
        await sendNotificationContinua(notascontinuas[i], usuarioscontinuos[i], continuo[i]);
      }
    }

    // Enviar notificaciones de tratamientos
    if (treatments.length > 0) {
      for (let i = 0; i < treatments.length; i++) {
        await sendNotification(treatments[i], usuarios[i]);
      }
    }

    console.log('Revisión y envío de notificaciones completados.');
  } catch (error) {
    console.error('Error al revisar las notas y tratamientos:', error);
  }
}, 60000); // 60000 milisegundos = 1 minuto

  async function getPendingTreatments() {
    const now = new Date();

    
  // Calculate 5 minutes ago and 5 minutes ahead
  const fiveMinutesAgo =  new Date(now.setHours(now.getHours() - 5, now.getMinutes() - 5, 0, 0));
  const fiveMinutesAhead =  new Date(now.setHours(now.getHours(), now.getMinutes() + 5, 0, 0));
  const fiveHoursAgo=new Date(now.setHours(now.getHours()-5))

  const treatments = await HistorialTratamiento.findAll({
    where: {
      fecha_administracion: {
        [Op.between]: [fiveMinutesAgo, fiveMinutesAhead]
      }
    },
    order: [['fecha_administracion', 'ASC']]
  });

  const borrarHistorial = await HistorialTratamiento.findAll({
    where: {
      ultima_fecha: {
        [Op.lt]: fiveHoursAgo,
      }
    },
  });

  if (!borrarHistorial) {
    console.log('No hay historial de tratamiento para borrar pendientes .');
    return false;
  }

  for (const historialItem of borrarHistorial) {
    await historialItem.destroy();
}

    if (!treatments) {
      console.log('No hay tratamientos pendientes para enviar notificaciones.');
      return false;
    } else {
      console.log(`Hay ${treatments.length} tratamientos pendientes para enviar notificaciones.`);
    }


    console.log(`${ fiveHoursAgo}`);

    const pacientes = await Promise.all(
      treatments.map(treatment => Paciente.findOne({
        where: {
          id_paciente: treatment.id_paciente
        }
      }))
    ); 

    const usuarios = await Promise.all(
      pacientes.map(paciente => Usuario.findOne({
        where: {
          id_usuario: paciente.id_usuario
        }
      }))
    );
    

    return { treatments, usuarios };
  }

  async function getPendingNotas() {
    const now = new Date();

  // Calculate 5 minutes ago and 5 minutes ahead
  const fiveMinutesAgo =  new Date(now.setHours(now.getHours() - 5, now.getMinutes() - 5, 0, 0));
  const fiveMinutesAhead =  new Date(now.setHours(now.getHours(), now.getMinutes() + 5, 0, 0));
  const fiveHoursAgo=new Date(now.setHours(now.getHours()+5))

  const notascontinuas = await HistorialNotas.findAll({
    where: {
      fechas: {
        [Op.between]: [fiveMinutesAgo, fiveMinutesAhead]
      },
    },
    order: [['fechas', 'ASC']]
  });

  const notasrecordatorio = await Notas.findAll({
    where: {
      hora_programada: {
        [Op.between]: [fiveMinutesAgo, fiveMinutesAhead]
      },
      recordatorio:true
    },
  });

    if (!notascontinuas) {
      console.log('No hay notascontinuas pendientes para enviar notificaciones.');
      return false;
    } else {
      console.log(`Hay ${notascontinuas.length} notascontinuas pendientes para enviar notificaciones.`);
    }

    const borrarHistorial = await HistorialNotas.findAll({
      where: {
        ultima_fecha: {
          [Op.lt]: fiveHoursAgo,
        }
      },
    });
  
    if (!borrarHistorial) {
      console.log('No hay historial de notas para borrar pendientes .');
      return false;
    }
  
    for (const historialItem of borrarHistorial) {
      await historialItem.destroy();
  }

    if (!notasrecordatorio) {
      console.log('No hay notasrecordatorio pendientes para enviar notificaciones.');
      return false;
    } else {
      console.log(`Hay ${notasrecordatorio.length} notasrecordatorio pendientes para enviar notificaciones.`);
    }

    const continuo = await Promise.all(
      notascontinuas.map(notascontinuas => Notas.findOne({
        where: {
          id_notas: notascontinuas.id_notas
        }
      }))
    ); 

    const usuarioscontinuos = await Promise.all(
      continuo.map(continuo =>  Usuario.findOne({
        where: {
          id_usuario: continuo.id_usuario
        }
      }))
    );


    const usuariosrecordatorios = await Promise.all(
      notasrecordatorio.map(notasrecordatorio => Usuario.findOne({
        where: {
          id_usuario: notasrecordatorio.id_usuario
        }
      }))
    );

    return { usuariosrecordatorios, usuarioscontinuos,continuo,notasrecordatorio,notascontinuas};
  }

  async function _showNotification(message) {
    const notification = message.notification;
    const android = message.notification?.android;
  
    if (notification && android) {
      try {
        // Aquí simulamos el comportamiento de flutterLocalNotificationsPlugin
        console.log(`Mostrando notificación: ${notification.title} - ${notification.body}`);
        return true;
      } catch (error) {
        console.error('Error al mostrar notificación:', error);
        return false;
      }
    }
    return false;
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
      const response = await admin.messaging().send(message);
      console.log('Mensaje enviado exitosamente');

      const notificationShown = await _showNotification(message);
    if (notificationShown) {
      console.log('Notificación mostrada en el cliente');
    } else {
      console.log('No se pudo mostrar la notificación en el cliente');
    }
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
      const response = await admin.messaging().send(message);
      console.log('Mensaje enviado exitosamente');

      const notificationShown = await _showNotification(message);
    if (notificationShown) {
      console.log('Notificación mostrada en el cliente');
    } else {
      console.log('No se pudo mostrar la notificación en el cliente');
    }
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
    const response = await admin.messaging().send(message);
    console.log('Mensaje enviado exitosamente');

    const notificationShown = await _showNotification(message);
  if (notificationShown) {
    console.log('Notificación mostrada en el cliente');
  } else {
    console.log('No se pudo mostrar la notificación en el cliente');
  }
    return true;

  } catch (error) {
    console.error('Error al enviar notificación:', error.message || String(error));
    throw new Error(`Error al enviar mensaje: ${error.message || String(error)}`);
  }
}





