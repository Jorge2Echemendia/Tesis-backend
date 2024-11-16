import express from "express";
import {
    listarPaciente,
    crearPaciente,
    modificarPaciente,
    eliminarPaciente,
} from "../controllers/pacientesController.js";
import checkAuth from "../middleware/autenMiddleware.js";

const router = express.Router();

router.get("/listar",checkAuth,listarPaciente);
router.post("/crear",checkAuth,crearPaciente);
router.put("/modificar/:id_paciente",checkAuth,modificarPaciente);
router.delete("/eliminar/:id_paciente",checkAuth,eliminarPaciente);


export default router;