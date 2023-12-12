import { z } from "zod";

const UserSchema = z.object({
  userData: z.object({
    email: z.string().trim().max(100).email().toLowerCase(),
    password: z
      .string()
      .min(8)
      .max(16)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/),
    user_type: z.string(),
    url_foto: z.string().optional(),
  }),
});

const StudentSchema = z.object({
  userTypeData: z.object({
    name: z.string().trim().max(100),
    lastName: z.string().max(120).trim(),
    document_type: z.string(),
    document: z.string().max(20).trim(),
    programsId: z.string(),
  }),
});

const ProfessorSchema = z.object({
  userTypeData: z.object({
    document: z.string().max(100).trim(),
    name: z.string().max(20).trim(),
    lastName: z.string().max(120).trim(),
    programsId: z.string(),
  }),
});

const SignInSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(16),
});

const RecoverySchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

const UpdateSchema = z.object({
  password: z.string().min(8).max(16),
});

const SignUpStudentSchema = UserSchema.merge(StudentSchema);
const SignUpProfessorSchema = UserSchema.merge(ProfessorSchema);
const PasswordUpdateSchema = RecoverySchema.merge(UpdateSchema);

export const validateCreate = async (data, tipoUsuario) => {
  if (tipoUsuario === "estudiante") {
    return SignUpStudentSchema.safeParseAsync(data);
  }
  if (tipoUsuario === "docente") {
    return SignUpProfessorSchema.safeParseAsync(data);
  }
  return UserSchema.safeParseAsync(data);
};

export const validateSignIn = async (data) => {
  return SignInSchema.safeParseAsync(data);
};

export const validatePasswordRecovery = async (data) => {
  return RecoverySchema.safeParseAsync(data);
};

export const validatePasswordUpdate = async (data) => {
  return UpdateSchema.safeParseAsync(data);
};

export const studentFields = [...Object.keys(SignUpStudentSchema.shape)];
export const professorFields = [...Object.keys(SignUpProfessorSchema.shape)];
export const userAdmin = [...Object.keys(UserSchema.shape)];
export const signInFields = [...Object.keys(SignInSchema.shape)];
