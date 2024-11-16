import express from "express";
import {
    crear,
    eliminarHistorialPorUltimaFecha,
    obtenerHistorial } from '../controllers/historialtratamientosController.js';
    import checkAuth from "../middleware/autenMiddleware.js";

    const router = express.Router();

router.get("/crear/:id_paciente",crear);
router.get("/obtenerHistorial/:id_tratamiento",obtenerHistorial);
router.delete("/eliminarHistorialPorUltimaFecha",checkAuth,eliminarHistorialPorUltimaFecha);


export default router;