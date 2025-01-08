import cloudinary from '../config/cloudinary.js';
import emailRegistro from '../helpers/emailRegistro.js';
import generarId from '../helpers/generarId.js';
import generarJWT from "../helpers/generarJWT.js";
import Usuario from '../models/user.js';

const actualizar = async (req, res, next) => {
  try {
    const { id_usuario } = req.params;
    const usuarioActual = await Usuario.findById(id_usuario);

    if (!usuarioActual) {
      return res.status(400).json({
        msg: 'Usuario no encontrado',
        success: false
      });
    }

    // Datos del usuario a actualizar
    let datosActualizacion = {};

    // Si los datos vienen como JSON string (multipart/form-data)
    if (req.body.usuar) {
      try {
        datosActualizacion = JSON.parse(req.body.usuar);
      } catch (e) {
        return res.status(400).json({
          msg: "Error al parsear los datos de usuario",
          success: false
        });
      }
    } else {
      // Si los datos vienen directamente en el body (application/json)
      datosActualizacion = req.body;
    }

    // Validaciones
    if (datosActualizacion.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosActualizacion.email)) {
      return res.status(400).json({
        msg: "Por favor, ingrese un correo electrónico válido",
        success: false
      });
    }

    if (datosActualizacion.telefono && (!/^\d+$/.test(datosActualizacion.telefono) || datosActualizacion.telefono.length !== 8)) {
      return res.status(400).json({
        msg: "El teléfono debe contener exactamente 8 dígitos",
        success: false
      });
    }

    // Manejo de la imagen
    let nuevaImagen = usuarioActual.imagen; // Mantener la imagen actual por defecto

    if (req.files && req.files.length > 0) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream({
            folder: 'your_folder_name',
            timeout: 120000
          }, (error, result) => {
            if (error) {
              console.error('Error al subir la imagen a Cloudinary:', error);
              return reject(error);
            }
            resolve(result);
          });

          stream.end(req.files[0].buffer);
        });
        nuevaImagen = result.secure_url;
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        // Continuar con la actualización sin cambiar la imagen
      }
    }

    // Preparar objeto de actualización
    const actualizacion = {
      nombre: datosActualizacion.nombre || usuarioActual.nombre,
      apellido: datosActualizacion.apellido || usuarioActual.apellido,
      telefono: datosActualizacion.telefono || usuarioActual.telefono,
      imagen: nuevaImagen
    };

    // Si el email es diferente, actualizar y marcar como no confirmado
    if (datosActualizacion.email && datosActualizacion.email !== usuarioActual.email) {
      actualizacion.email = datosActualizacion.email;
      actualizacion.confirmado = false;
      actualizacion.token = generarId();
    }

    // Si hay nueva contraseña, actualizarla
    if (datosActualizacion.password) {
      actualizacion.password = datosActualizacion.password;
    }

    const actualizadoUser = await Usuario.findByIdAndUpdate(
      id_usuario,
      actualizacion,
      { 
        new: true,
        runValidators: true
      }
    );

    // Si el email cambió, enviar correo de confirmación
    if (datosActualizacion.email && datosActualizacion.email !== usuarioActual.email) {
      emailRegistro({
        email: actualizadoUser.email,
        nombre: actualizadoUser.nombre,
        token: actualizadoUser.token
      });
    }

    res.json({
      msg: datosActualizacion.email && datosActualizacion.email !== usuarioActual.email 
        ? "Usuario actualizado. Por favor, confirme su nuevo correo electrónico"
        : "Usuario actualizado correctamente",
      success: true,
      data: actualizadoUser,
      token: actualizadoUser.token
    });

  } catch (error) {
    console.error('Error en actualización:', error);
    return res.status(500).json({
      msg: "Error al actualizar el usuario",
      success: false,
      error: error.message
    });
  }
};

const registrar = async (req, res, next) => {
  try {
    const usuar = JSON.parse(req.body.usuar);
    console.log(`Datos del usuario: ${JSON.stringify(usuar)}`);
    console.log(`Datos del ususario: ${usuar}`);
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

    const files = req.files;

    if (files.length > 0) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream({
          folder: 'your_folder_name',
          timeout: 120000
        }, (error, result) => {
          if (error) {
            console.error('Error al subir la imagen a Cloudinary:', error);
            return reject(error);
          }
          resolve(result);
        });

        stream.end(files[0].buffer);
      });

      usuar.imagen = result.secure_url;
    }

    const existeUsuario = await Usuario.findOne({ email: usuar.email });

    if (existeUsuario) {
      return res.status(400).json({
        msg: "Usuario ya registrado",
        success: false
      });
    }

    const newUser = await Usuario.create(usuar);
    emailRegistro({ 
      email: usuar.email, 
      nombre: usuar.nombre, 
      token: newUser.token 
    });

    res.json({
      msg: "Usuario creado correctamente",
      success: true,
      data: newUser,
      token: newUser.token
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error al registrar el usuario",
      success: false,
    });
  }
};

const updateToken = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const usuario = await Usuario.findByIdAndUpdate(
      id_usuario,
      { notificacion_token: req.body.token },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ 
        msg: "Usuario no encontrado", 
        success: false 
      });
    }

    return res.status(201).json({
      success: true,
      msg: 'El token de notificacion se almaceno',
      data: usuario.notificacion_token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      msg: "Error al guardar el token de notificacion" 
    });
  }
};

const confirmar = async (req, res) => {
  try {
    const { token } = req.params;
    const usuario = await Usuario.findOneAndUpdate(
      { token },
      { 
        token: null,
        confirmado: true 
      },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({
        msg: "Token no válido",
        success: false
      });
    }

    res.json({
      msg: "Usuario Confirmando Correctamente",
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error al confirmar el usuario",
      success: false
    });
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    return res.status(404).json({ 
      msg: "El usuario no existe",
      success: false 
    });
  }

  if (!usuario.confirmado) {
    return res.status(403).json({ 
      msg: "La cuenta no ha sido confirmada",
      success: false 
    });
  }

  const passwordCorrecta = await usuario.comprobarPassword(password);

  if (passwordCorrecta) {
    const data = {
      id_usuario: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: usuario.password,
      telefono: usuario.telefono,
      imagen: usuario.imagen,
      token: generarJWT(usuario._id),
      notificacion_token: usuario.notificacion_token,
      tipo_usuario: usuario.tipo_usuario
    };

    res.json({
      msg: "Bienvenido",
      success: true,
      data: data
    });
  } else {
    return res.status(403).json({
      msg: "La contraseña es incorrecta",
      success: false 
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const usuario = await Usuario.findById(id_usuario);
    
    if (!usuario) {
      return res.status(404).json({ 
        msg: "Usuario no encontrado", 
        success: false 
      });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const olvidePassword = async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const existeUsuario = await Usuario.findOneAndUpdate(
      { nombre, email },
      { password },
      { new: true }
    );

    if (!existeUsuario) {
      return res.status(400).json({ 
        msg: "El usuario no existe" 
      });
    }

    res.json({
      msg: "Contraseña cambiada",
      success: true,
      data: existeUsuario.password
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      msg: "Error al actualizar contraseña" 
    });
  }
};

export {
  actualizar, autenticar,
  confirmar, getUser, olvidePassword, registrar, updateToken
};





