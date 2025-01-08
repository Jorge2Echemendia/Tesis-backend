import express from "express";
import {
    crear,
    obtenerHistorial } from '../controllers/historialtratamientosController.js';

    const router = express.Router();

router.get("/crear/:id_paciente",crear);
router.get("/obtenerHistorial/:id_tratamiento",obtenerHistorial);


export default router;