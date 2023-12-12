import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",

  port: 465,
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.PASSWORD_SENDER,
  },
});

export const emailStructure = ({
  asunto,
  correo,
  token = {},
  numeroOrden = {},
  mensaje = {},
  respuesta = {},
}) => {
  if (asunto === "confirmacion") {
    return {
      from: `LOT System ${process.env.EMAIL_SENDER}`,
      to: correo,
      subject: "Correo de verificación de cuenta",
      text: "Tu usuario se ha creado satisfactoriamente",
      html: `   <table style="width: 100%; height: 100%; background-color: #f2f2f2; padding: 0; margin: 0;">
                  <tr>
                    <td align="center" valign="top">
                      <img src="https://res.cloudinary.com/dx8hzlwrp/image/upload/v1702329834/w6toqh3a0xmxilyslxex.png" alt="logo" border="0" width="200">
                    </td>
                    <td align="center" valign="top">
                      <body>
                          <h1>¡Bienvenido a LOT System!</h1>
                          <p>Gracias por registrarte en nuestro sitio web. Para completar el proceso de registro, haz clic en el siguiente enlace:</p>
                           <a href="${process.env.WEB_URL}/activacion/${token}">Confirmar registro</a>
                          <p>Si no has solicitado este registro, ignora este correo electrónico.</p>
                          <p>Atentamente,</p>
                          <p>El equipo de LOT</p>
                      </body>
                    </td>
                  </tr>
                </table>
      `,
    };
  }

  if (asunto === "recuperacion") {
    return {
      from: `LOT System ${process.env.EMAIL_SENDER}`,
      to: correo,
      subject: "Correo de recuperación de contraseña",
      text: "Se realizará el reestablecimiento de tu contraseña",
      html: `   <table style="width: 100%; height: 100%; background-color: #f2f2f2; padding: 0; margin: 0;">
                  <tr>
                    <td align="center" valign="top">
                    <img src="https://res.cloudinary.com/dx8hzlwrp/image/upload/v1702329834/w6toqh3a0xmxilyslxex.png" alt="logo" border="0" width="200">
                    </td>
                    <td align="center" valign="top">
                      <body>
                          <h1>¡Recuperación de contraseña!</h1>
                          <p>Se ha realizado la solicitud para reestablecer tu contraseña, para realizar el cambio ingresa en el siguiente enlace</p>
                           <a href="${process.env.WEB_URL}/Recoverypassword/${token}">Reestablecer Contraseña</a>
                          <p>Si no has solicitado este cambio, ignora este correo electrónico.</p>
                          <p>Atentamente,</p>
                          <p>El equipo de LOT</p>
                      </body>
                    </td>
                  </tr>
                </table>
      `,
    };
  }
};
