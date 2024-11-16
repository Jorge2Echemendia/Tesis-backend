import nodemailer from 'nodemailer';

const emailRegistro = async(datos)=>{
  const {email,nombre,token} = datos;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        method: 'PLAIN'
      }
    });
  //Enviar el email
  const info = await transporter.sendMail({
     from: 'Bienvenido a su oftalmólogo virtual',
     to:email,
     subject: 'Comprueba tu cuenta en nuetro sistema ',
     text: 'Comprueba tu cuenta en nuetro sistema ',
     html:`<p>Hola: ${nombre}, comprueba tu cuenta para poder acudir a nuestros servicios</p>
          <p>Tu cuenta ya esta lista, solo debes comprobarla en el siguente enlace:<a href="${process.env.FRONTEND_URL}/usuario/confirmar/${token}">Comprobar Cuenta</a></p>

          <p>Si tu no creaste esta cuenta puedes ignorar este mensaje. Cuida tu privacidad. Todo facil y seguro</p>
     `,


  })

console.log("Mensaje enviado: %s", info.messageId);
  } catch (error) {
    console.error("Error al enviar el email electrónico:");
    console.log(error);
    
  }
    

};

export default emailRegistro;