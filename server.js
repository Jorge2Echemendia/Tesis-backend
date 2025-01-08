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
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { initNotifications } from './controllers/notificationController.js';

const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

async function initFirebaseAdmin() {
  //const serviceAccountJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8'));
  const serviceAccountJson = {
  "type": "service_account",
    "project_id": "tesis-f0a5e",
    "private_key_id": "d357cf49e5f65ba1a1038ba33389685b35d488a9",
    "private_key":
        "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCZ/L1g9Gt6BeoC\n+VtkhRPUG4gNDf5K/kCLLNWoXTyblo2flBdfqMON+u5Le+PP6qDRqxijpPLO9TRB\nj5UyufGPkxS0Lxi3mCn5pmyiTY5prqXNXUpwqvn7B4vsdxIDWE8aPywqMQJC+sCm\nICTJM02ZlrbLcleQcgepL+r+2Yd30U8fImT2GlkckKhqDCeM36k2x9bvlJbgR5ta\ndduE0sKeejxShiQ49YBnlR/tTz+GA6k2JuY2vRGPIgW68qd17vu0YMcqk8FY9iBu\nxtFTmt5RGG01GZITIBmgXkRTM98DsHJ188lyP5pCtQjLMYMJWqYpRZYk+xk8VACr\nWupOh4K5AgMBAAECggEABYssKLNH8sHHf9GpFQR29ygCFQE71kiSu4fyza/EnK/V\n+6id0k1ts9z0qv5D8HJolX/IwGxx6to4RkN0ajn4PLRddpKq+8IUQcb4anvrDHoz\ngSISid2X6A4InyvWt8zcNSxQy1iOFan4GUr3NBCfIrBCtq6QQTSfurstRT1A06ME\nvsaS1cAHvB47XNMDpHZ4m5DBrNIKJGsySCLOgNiWaeIvSHV2PzOgQqcZRQ45KMVR\n+bESndEOEzxUXJozozc1qFuKEoqYlIJeihrXWdsQZTImUBA+xDJjttA4gfMfUUf4\nvnpncI04TN0J/GvUapH8MBPG/2uWrOydjgo7usbG8QKBgQDLYGIi2mSIr23JTQOW\no3S5brUJbDUBHO2ISt3hqN6SWHq2scPjIBmgC/wQQjfEpk7wwe7DoYWm5wZ1QmCZ\nptDTwAzFNUq7ejAZoavZskPpq/q9QerGfWMIaK4EH+od03bgqfwLta6ZYf5c6ctZ\noM6aZSJ4SfMIrRup8L/LtSRPqQKBgQDB1NLvmNe8lMw71kMRB5G+/eRrLHdPgv/w\n0bXFrf4reaz8tVWUV5Lz5hqmUm6EWt98HH034AZDR3SDTwws7myMxhkSIUPbGEyi\nGW/SWf6Q5vj8MOo2Zi8BYZPseLdT2smvseI9QomBcfZybqnKXs5XMkIdAb6HnQJV\nYgW8R9HEkQKBgQCw8XOQdUhAr7iqCipUFnSInOw/fXiENmHnUZPIMH8s/nQNnY4b\nfqMs3yB4GNSicDuANoqAhHhe5ON2g8C+DifkA1RZA+u4Py+4LTPyHKn/lNR7cu1L\nsm3GNCUqi4XKW2AzSVFz8qcs5dhDiFmW6lS2ecVKuLQNWWcXLNIB7uDfuQKBgCmo\nWNE/sxYHkMFHclCFpPA8Vswl2VqQV/tkxsE+fMLROrlxK3xfOekLSiz2yGPPt/pP\nkSXiEtaA0+yon4BEmbXDmX3JAnFjDo1EFEFMMCbqTRa+WIfqfC26z/ThmNz/x5ro\nCyyJUU4ttP6xA/LHX2dkGMttJYq11tuM3pixgsbRAoGAbuL5vK+crODanQxPMzNO\nmYEN6v9TJwMR+fL5iQ+fokCFAHJlUhYbvrMl8HfUgPi+A+c9ZulXx32dsmUEpJdM\n6zRcF2KLXOzmkpyfkUmExhfiKF1QoXj9wqDS6+IskjzTgNrOWldPoH1ilswIQHy8\niRBMcVYbTeHTfGw3Nb4DdX8=\n-----END PRIVATE KEY-----\n",
    "client_email": "aplicacion-tesis@tesis-f0a5e.iam.gserviceaccount.com",
    "client_id": "101653246232881824194",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url":
        "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url":
        "https://www.googleapis.com/robot/v1/metadata/x509/aplicacion-tesis%40tesis-f0a5e.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
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

initFirebaseAdmin().then(async () => {
  try {
    // Inicializar Firebase
    initNotifications(admin);
    
    const PORT = process.env.PORT || 3000;
    const app = express();
    const server = createServer(app);

    // Configuración de middleware
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.disable('x-powered-by');
    app.set('port', PORT);

    // Configuración de variables de entorno
    dotenv.config();

    // Conectar a MongoDB
    await db();

    // Configuración de CORS
    const dominiosPermitidos = ["http://192.168.43.105:3000"];
    const corsOptions = {
      origin: function(origin, callback) {
        if (dominiosPermitidos.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('No permitido por CORS'));
        }
      }
    };
    
    app.use(cors());

    // Rutas
    app.use("/usuario", userRoutes);
    app.use("/paciente", pacienteRoutes);
    app.use("/tratamiento", tratamientoRoutes);
    app.use("/historialtratamientos", historialtratamientosRoutes);
    app.use("/configuracion", configuracionRoutes);
    app.use("/notas", notasRoutes);

    // Iniciar servidor
    server.listen(PORT, '192.168.43.105', () => {
      console.log(`Servidor iniciado en el puerto ${PORT}`);
    });

    // Manejador de errores
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor',
        error: err.message 
      });
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
});
