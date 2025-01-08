// authMiddleware.js
import Jwt from "jsonwebtoken";
import Usuario from "../models/user.js";

const checkAuth = async (req, res, next) => {
 let token;
 if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
 ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({
          msg: 'Token no proporcionado'
        });
      }

      const decoded = Jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = await Usuario.findById(decoded.id).select("-password -token -confirmado");
      
      if (!req.usuario) {
        return res.status(403).json({ msg: "Usuario no encontrado" });
      }
      
      return next();
    } catch (error) {
      console.log("Error en verificación:", error);
      return res.status(401).json({
        msg: 'Token no válido'
      });
    }
 }
 if (!token) {
    const error = new Error("Token no válido o inexistente");
    return res.status(401).json({
      msg: error.message
    });
 }
};

export default checkAuth;