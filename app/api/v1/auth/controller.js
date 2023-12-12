import { prisma } from "../../../database.js";
import { signToken, verifyToken } from "../auth.js";
import { transporter, emailStructure } from "../mailer.js";
import {
  validateCreate,
  validatePasswordRecovery,
  validatePasswordUpdate,
  validateSignIn,
} from "./model.js";
import {
  ifType,
  isActive,
  urlFoto,
  encryptPassword,
  verifyPassword,
} from "./utils.js";

export const tipo = async (req, res, next) => {
  const { params = {} } = req;
  try {
    console.log(params.tipo);
    if (ifType(params.tipo)) {
      next({
        message: "Tipo de usuario inválido",
        status: 404,
      });
    } else {
      req.tipo = params.tipo;
      next();
    }
  } catch (error) {
    next(error);
  }
};

export const authEmail = async (req, res, next) => {
  const { params = {} } = req;
  const { token } = params;
  const decoded = verifyToken(token);

  if (!decoded) {
    return next({
      message: "Prohibido",
      status: 400,
    });
  }

  const { email, user_type } = decoded;

  const estatus = isActive(user_type);

  try {
    await prisma.usuario.update({
      where: {
        email,
      },
      data: {
        user_status,
        updatedAt: new Date().toISOString(),
      },
    });

    res.status(201);
    res.json({
      message: "Autenticacion correcta",
    });
  } catch (error) {
    next({
      message: "No se pudo autenticar la cuenta",
      status: 400,
    });
  }
};

export const resendEmail = async (req, res, next) => {
  const { body } = req;
  const { email } = body;

  try {
    const user = await prisma.users.findUnique({
      where: {
        email,
        user_status: "Confirmacion",
      },
    });

    if (!user) {
      return next({
        message: "El email no se encuentra registrado",
        status: 400,
      });
    }

    const { user_type: tipoUsuario } = user;
    const token = signToken({ email, tipoUsuario });
    const mail = emailStructure({ asunto: "confirmacion", email, token });
    await transporter.sendMail(mail);

    res.status(200);
    res.json({
      message: "Se ha enviado el mensaje de autenticación a su correo",
    });
  } catch (error) {
    return next({ error });
  }
};

export const signup = async (req, res, next) => {
  const { body = {}, tipo } = req;
  const { data: bodyData } = body;

  const photoReq = req.files
    ? req.files.filter((file) => file.mimetype === "image/jpeg")
    : [];

  const signUpBody = JSON.parse(bodyData);

  const { success, data, error } = await validateCreate(signUpBody, tipo);
  if (!success) {
    return next({
      message:
        "Los datos ingresados en el formulario no son correctos, vuelva a intentarlo",
      status: 400,
      error,
    });
  }

  const { userData, userTypeData } = data;
  const password = await encryptPassword(data.userData.password);
  const foto = await urlFoto(photoReq);
  try {
    await prisma.$transaction(async (transaction) => {
      const userResult = await transaction.users.create({
        data: {
          ...userData,
          url_foto: foto,
          user_status: "Confirmacion",
          password: password,
        },
      });

      const {
        email: correo,
        id: userID,
        tipo_usuario: tipoUsuario,
      } = userResult;
      const token = signToken({ correo, tipoUsuario });

      const mail = emailStructure({ asunto: "confirmacion", correo, token });

      await transporter.sendMail(mail);

      if (tipo === "estudiante") {
        await transaction.students.create({
          data: {
            usersId: userID,
            ...userTypeData,
          },
        });
      }

      if (tipo === "docente") {
        await transaction.professor.create({
          data: {
            usersId: userID,
            ...userTypeData,
          },
        });
      }

      const message =
        tipo !== "docente"
          ? "Usuario creado satisfactoriamente, revisa tu correo para confirmar tu cuenta"
          : "Usuario creado satisfactoriamente, espera a que un administrador confirme tu cuenta";

      res.status(201).json({ message });
    });
  } catch (error) {
    next({
      message:
        "No se pudo crear el usuario, el correo o documento  ya se encuentra registrado en el sistema",
      status: 400,
      error,
    });
  }
};

export const signin = async (req, res, next) => {
  const { body = {} } = req;

  try {
    const { success, data, error } = await validateSignIn(body, tipo);
    if (!success)
      return next({
        error,
      });
    console.log({ data });
    const { email, password: contrasena } = data;

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
      include: {
        student: true,
        professor: true,
      },
    });

    if (!user) {
      return next({
        message: "Correo o contraseña incorrectos",
        status: 403,
      });
    }

    if (user.user_status !== "Activo") {
      const message =
        user.user_status === "Confirmacion"
          ? "Correo no confirmado"
          : "Usuario no activo o bloqueado";
      return next({
        message,
        status: 403,
      });
    }

    const confirmPassword = await verifyPassword(contrasena, user.password);

    if (!confirmPassword) {
      return next({
        message: "Correo o contraseña incorrectos",
        status: 403,
      });
    }

    const typeData = !!user.student
      ? await prisma.students.findUnique({
          where: {
            id: user.student.id,
          },
        })
      : !!user.professor
      ? await prisma.professor.findUnique({
          where: {
            id: user.professor.id,
          },
        })
      : { id: "Administrativo" };

    const { id, user_type: tipo_usuario } = user;
    const { id: idType } = typeData;

    const token = signToken({ id, tipo_usuario, idType });

    res.json({
      data: {
        user: {
          ...user,
          id: undefined,
          password: undefined,
          student: undefined,
          professor: undefined,
        },
        typeData: {
          ...typeData,
          id: undefined,
          userId: undefined,
        },
      },
      meta: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const passwordRecovery = async (req, res, next) => {
  const { body = {} } = req;

  try {
    const { success, data, error } = await validatePasswordRecovery(body);
    if (!success)
      return next({
        error,
      });

    const { correo: email } = data;
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
        user_status: true,
      },
    });

    if (user === null) {
      return next({
        message:
          "Si su correo se encuentra registrado, recibira un correo con un enlace para continuar",
        status: 200,
      });
    }

    const { tipo_usuario: tipoUsuario } = user;
    const token = signToke({ correo, tipoUsuario });

    const mail = emailStructure({ asunto: "recuperacion", correo, token });
    await transporter.sendMail(mail);

    res.json({
      message:
        "Si su correo se encuentra registrado, recibira un correo con un enlace para continuar",
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  const { body = {}, params = {} } = req;
  const { token } = params;
  const decoded = verifyToken(token);
  const { correo } = decoded;

  if (!decoded) {
    return next({
      message: "Prohibido",
      status: 403,
    });
  }

  try {
    const { success, data, error } = await validatePasswordUpdate(body);

    if (!success)
      return next({
        error,
      });

    try {
      const password = await encryptPassword(data.contrasena);
      await prisma.users.update({
        where: {
          email,
        },
        data: {
          password: password,
          updatedAt: new Date().toISOString(),
        },
      });
      res.json({
        message: "Contraseña actualizada correctamente",
        status: 200,
      });
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

export const testActivationLink = async (req, res, next) => {
  const { body } = req;
  const { correo } = body;

  try {
    const user = await prisma.users.findUnique({
      where: {
        email,
        user_status: "Confirmacion",
      },
    });

    if (!user) {
      return next({
        message: "El email no se encuentra registrado",
        status: 400,
      });
    }

    const { tipo_usuario: tipoUsuario } = user;
    const token = signToken({ correo, tipoUsuario });

    res.status(200);
    res.json({
      activation_url: `${process.env.WEB_URL}/activacion/${token}`,
    });
  } catch (error) {
    return next({ error });
  }
};
