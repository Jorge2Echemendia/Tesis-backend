import express from "express";
import {
    listarConfiguraciones,
    crearConfiguracion,
    eliminarConfiguracion,
    modificarConfiguracion,
    listarConfiguracion
} from "../controllers/configuracionController.js";
import checkAuth from "../middleware/autenMiddleware.js";

const router = express.Router();

router.get("/listarConfiguracion/:id_paciente",checkAuth,listarConfiguracion);
router.get("/listarConfiguraciones",checkAuth,listarConfiguraciones);
router.post("/crear",checkAuth,crearConfiguracion);
router.put("/modificarConfiguracion/:id_configuracion",checkAuth,modificarConfiguracion);
router.delete("/eliminarConfiguracion/:id_configuracion",checkAuth,eliminarConfiguracion);


export default router;