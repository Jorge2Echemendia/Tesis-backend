import cors from 'cors';
import dotenv from "dotenv";
import express from 'express';
import admin from 'firebase-admin';
import { createServer } from 'http';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import db from "./config/db.js";
import { initNotifications } from './controllers/notificationController.js';
import configuracionRoutes from './routes/configuracionRoutes.js';
import historialtratamientosRoutes from './routes/historialtratamientosRoutes.js';
import notasRoutes from './routes/notasRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';
import tratamientoRoutes from './routes/tratamientoRoutes.js';
import userRoutes from './routes/userRoutes.js';
import firebase from'./config/firebase.js'

dotenv.config(); // Cargar variables de entorno

const __filename = fileURLToPath(import.meta.url);

async function initFirebaseAdmin() {
  const serviceAccountJson = {
    "type":firebase.type,
    "project_id":firebase.project_id,
    "private_key_id":firebase.private_key_id,
    "private_key":firebase.private_key,
    "client_email":firebase.client_email,
    "client_id":firebase.client_id,
    "auth_uri":firebase.auth_uri,
    "token_uri":firebase.token_uri,
    "auth_provider_x509_cert_url":firebase.auth_provider_x509_cert_url,
    "client_x509_cert_url":firebase.client_x509_cert_url,
    "universe_domain":firebase.universe_domain
  };

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  };
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
    const dominiosPermitidos = ["http://192.168.43.106:3000"];
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
    server.listen(PORT, '192.168.43.106', () => {
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
