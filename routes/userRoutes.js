import express from "express";
import {
    registrar,
    autenticar,
    confirmar,
    actualizar,
    getUser,
    updateToken,
    olvidePassword
} from "../controllers/usersController.js";
import checkAuth from "../middleware/autenMiddleware.js";
import multer from "multer";

const router = express.Router();

// Configurar multer
const upload = multer({  storage: multer.memoryStorage()});

router.get('/getUser/:id_usuario', getUser);
router.post('/registrar', upload.array('imagen',1), registrar); // Usa single en lugar de array
router.post("/login", autenticar);
router.get("/confirmar/:token", confirmar);
router.put('/actualizar/:id_usuario', upload.array('imagen',1), actualizar);
router.put('/updateToken/:id_usuario',checkAuth , updateToken);
router.put('/olvidePassword' , olvidePassword);


export default router;

