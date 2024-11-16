import express from "express";
import {
    crearTratamiento,
    eliminarTratamiento,
    modificarTratamiento,
    listarTratamientoClientes,
    listarTratamientoAd,
    listarTratamientotodoClientes,
    asignarIDPaciente
} from "../controllers/tratamientoController.js";
import checkAuth from "../middleware/autenMiddleware.js";

const router = express.Router();

router.get("/listarclien/:id_paciente",checkAuth,listarTratamientoClientes);
router.post("/asignaridpaciente/:id_paciente/:id_tratamiento",checkAuth,asignarIDPaciente);
router.get("/listarclientfaltante/:id_paciente",checkAuth,listarTratamientotodoClientes);
router.get("/listaradmin",checkAuth,listarTratamientoAd);
router.post("/crear",checkAuth,crearTratamiento);
router.put("/modificar/:id_tratamiento",checkAuth,modificarTratamiento);
router.delete("/eliminar/:id_tratamiento",checkAuth,eliminarTratamiento);


export default router;