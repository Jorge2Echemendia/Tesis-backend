import express from "express";
import {
    registrar,
    autenticar,
    confirmar,
    perfil,
    actualizar,
    getUser,
    updateToken
} from "../controllers/usersController.js";
import checkAuth from "../middleware/autenMiddleware.js";
import multer from "multer";

const router = express.Router();

// Configurar multer
const upload = multer({  storage: multer.memoryStorage()
   }); // Usa la misma configuración que en server.js

// Area Publica
router.get('/getUser/:id_usuario', getUser);
router.post('/registrar', upload.array('imagen',1), registrar); // Usa single en lugar de array
router.post("/login", autenticar);
router.get("/confirmar/:token", confirmar);
router.put('/actualizar/:id_usuario', upload.array('imagen',1), actualizar);
router.put('/updateToken/:id_usuario',checkAuth , updateToken);

// Area Privada
router.get("/perfil", checkAuth, perfil);

export default router;

// import express from 'express';

// import {createUser,getAllUsers}   from '../controllers/usersController.js';
// const router = express.Router();
// router.post('/', createUser);

// router.get('/', getAllUsers);

// export default router;

