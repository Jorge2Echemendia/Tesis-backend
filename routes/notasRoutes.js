import express from "express";
import {
    crearNota,
    modificarNota,
    listarNotas,
    eliminarNota } from '../controllers/notasController.js';
    import checkAuth from "../middleware/autenMiddleware.js";

    const router = express.Router();

router.post("/crearNota/:id_paciente",checkAuth,crearNota);
router.put("/modificarNota/:id_notas",checkAuth,modificarNota);
router.delete("/eliminarNota/:id_notas",checkAuth,eliminarNota);
router.get("/listar/:id_paciente",checkAuth,listarNotas);


export default router;