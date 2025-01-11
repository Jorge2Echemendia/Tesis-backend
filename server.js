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

dotenv.config(); // Cargar variables de entorno

const __filename = fileURLToPath(import.meta.url);

async function initFirebaseAdmin() {
  const service = {
    "type": process.env.FIREBASE_TYPE,
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Reemplazar \n por saltos de línea
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL,
    "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN
  };

  try {
    admin.initializeApp({
      credential: admin.credential.cert(service),
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
