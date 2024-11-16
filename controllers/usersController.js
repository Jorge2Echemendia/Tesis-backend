import generarJWT from "../helpers/generarJWT.js";
import emailRegistro from '../helpers/emailRegistro.js';
import user from '../models/user.js';
import   storage  from '../utils/053 cloud_storage.js';
import { where } from "sequelize";

const actualizar = async (req, res, next) => {
  try {
      const { id_usuario } = req.params;
      const data = await user.findOne({ where: { id_usuario } });

      if (!data.id_usuario) {
          return res.status(400).json({ 
              msg: 'ID del paciente no proporcionado.',
              success: false 
          });
      }

      let usuar;
      try {
        console.log('Datos recibidos:', req.body);
          usuar = JSON.parse(req.body.usuar);
      } catch (e) {
          return res.status(400).json({
              msg: "Error al parsear los datos de usuario",
              success: false
          });
      }

      console.log(`Datos del usuario: ${JSON.stringify(usuar)}`);

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuar.email)) {
          return res.status(400).json({
              msg: "Por favor, ingrese un correo electrónico válido",
              success: false
          });
      }

      if (!/^\d+$/.test(usuar.telefono) || usuar.telefono.length !== 8) {
          return res.status(400).json({
              msg: "El teléfono debe contener exactamente 8 dígitos",
              success: false
          });
      }

      if (!req.files) {
          return res.status(400).json({
              msg: "Por favor, seleccione una imagen",
              success: false
          });
      }

      const files = req.files;

      if (files.length > 0) {
          const pathImage = `image_${Date.now()}`;
          console.log(`PA:${pathImage}`);
          const url = await storage(files[0], pathImage);
          console.log(`${url}`);

          if (url !== undefined && url !== null) {
              usuar.imagen = url;
          }
      }

      if (data.email !== usuar.email) {
          data.nombre = usuar.nombre || data.nombre;
          data.apellido = usuar.apellido || data.apellido;
          data.email = usuar.email || data.email;
          data.password = usuar.password || data.password;
          data.telefono = usuar.telefono || data.telefono;
          data.imagen = usuar.imagen || data.imagen;

          const actualizadoUser = await data.save();

          emailRegistro({ 
              email: actualizadoUser.email, 
              nombre: actualizadoUser.nombre, 
              token: actualizadoUser.token 
          });

          res.json({
              msg: "Usuario actualizado",
              success: true,
              data: actualizadoUser,
              token: actualizadoUser.token
          });
      } else {
          data.nombre = usuar.nombre || data.nombre;
          data.apellido = usuar.apellido || data.apellido;
          data.email = usuar.email || data.email;
          data.password = usuar.password || data.password;
          data.telefono = usuar.telefono || data.telefono;
          data.imagen = usuar.imagen || data.imagen;

          const actualizadoUser = await data.save();

          res.json({
              msg: "Usuario actualizado",
              success: true,
              data: actualizadoUser,
              token: actualizadoUser.token
          });
      }
  } catch (error) {
      console.log(error);
      return res.status(500).json({
          msg: "Error al actualizar el usuario",
          success: false
      });
  }
};

const registrar = async (req, res,next) => {
    
  try {
    const usuar=JSON.parse(req.body.usuar);
    console.log(`Datos del usuario: ${JSON.stringify(usuar)}`);
    console.log(`Datos del ususario:${usuar}`);
    if (!usuar.email || !usuar.nombre) {
      return res.status(400).json({
        msg: "Email y nombre son obligatorios",
        success: false
      });
    }


    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuar.email)) {
      return res.status(400).json({
        msg: "Por favor, ingrese un correo electrónico válido",
        success: false
      });
    } 

    if (usuar.password.length < 8) {
      return res.status(400).json({
        msg: "La contraseña debe tener al menos 8 caracteres",
        success: false
      });
    }

    if (!/^\d+$/.test(usuar.telefono) || usuar.telefono.length !== 8) {
      return res.status(400).json({
        msg: "El teléfono debe contener exactamente 8 dígitos",
        success: false
      });
    }

    
    if (!req.files) {
      return res.status(400).json({
        msg: "Por favor, seleccione una imagen",
        success: false
      });
    }

    const files =req.files;

    
    if(files.length >0){
      const pathImage = `image_${Date.now()}`;
      console.log(`PA:${pathImage}`);
      const url = await storage(files[0],pathImage);
      console.log(`${url}`);


      if(url !=undefined && url!=null){
        usuar.imagen=url;
      }
    }
    const data = await user.findOne({ where: { email: usuar.email } });

  if (data) {
    return res.status(400).json({
      msg: "Usuario ya registrado",
      success: false
    });
  }

    // Guardar un usuario
    const newUser = await user.create(usuar);
    emailRegistro({ email: usuar.email, nombre: usuar.nombre, token: newUser.token });

    res.json({
      msg: "Usuario creado correctamente",
      success: true,
      data: newUser,
      token: newUser.token
    });
  } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Error al registrar el usuario" ,
        success:false,

      });
  }
};
const updateToken = async (req, res) => {
  
  try {
    const{id_usuario}  = req.params;
    const usuario= await user.findOne({where:{id_usuario: id_usuario}});

    if(!usuario){
      return res.status(404).json({ msg: "'Usuario no encontrado'", success: false });
    }

    usuario.notificacion_token=req.body.token;

    const usarioNotificaciontoKen= await usuario.save();

      return res.status(201).json({
        success:true,
        msg:'El token de notificacion se almaceno',
        data:usarioNotificaciontoKen.notificacion_token,
      })
  } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Error al guardar el token de notificacion" });
  }
};




const perfil = (req, res) => {
  const {usuario} = req;
  res.json( usuario);
};

const confirmar = async (req, res) => {
  const { token } = req.params;

  const data = await user.findOne({ where: { token } });
  
  if (!data ) {
      const error = new Error("Token no valido");
      return res.status(404).json({
        msg: error.message,
      success:false});
  }
      try {
          // Ahora es seguro acceder a data.token
          data.token = null;
          data.confirmado = true;
          await data.save();
          res.json({
            msg: "Usuario Confirmando Correctamente",
            success:true });
      } catch (error) {
          console.log(error);
          res.status(500).json({
            msg: "Error al confirmar el usuario",
            success:false });
      }
  
};
const autenticar = async (req, res) => {
    const { email, password } = req.body;

    // Verificando si el usuario Existe
    const contraseña = await user.findOne({ where: { email } });

    if (!contraseña) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({ 
          msg: error.message,
          success:false });
    }

    // Comprobar si el usuario esta confirmado
    if (!contraseña.confirmado) {
        const error = new Error("La cuenta no ah sido confirmada");
        return res.status(403).json({ 
          msg: error.message,
          success:false });
    }

    // Revisar el password
    const passwordCorrecta = await contraseña.comprobarPassword(password);
    const data={
      id_usuario:contraseña.id_usuario,
        nombre:contraseña.nombre,
        apellido:contraseña.apellido,
        email:contraseña.email,
        password:contraseña.password,
        telefono:contraseña.telefono,
        imagen:contraseña.imagen,
        token: generarJWT(contraseña.id_usuario),
        notificacion_token:contraseña.notificacion_token,
        tipo_usuario:contraseña.tipo_usuario }
    if (passwordCorrecta) {
        // Autenticars
        res.json({
            msg:"Bienvenido",
            success:true,
            data:data
          });
        } else {
        const error = new Error("La contraseña es incorrecto");
        return res.status(403).json({
          msg: error.message,
        success:false });
    }
};

const getUser = async (req, res) => {
  const {id_usuario} = req.params;
  const usuario = await user.findOne({ where: { id_usuario } });
  if (!usuario) {
    return res.status(404).json({ msg: "'Usuario no encontrado'", success: false });
}
  try {
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const createUser = async(req, res) => {
    try {
      const newUser = await user.create({
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        email: req.body.email_electronico,
        password: req.body.password,
        telefono: req.body.teléfono,
        imagen: req.body.imagen,
        token: req.body.token,
        confirmado: req.body.confirmado,

      });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };


export {
  autenticar, confirmar, createUser, perfil, registrar,actualizar,getUser,updateToken
};







//   export{
//     createUser,
//     getAllUsers

//   }



