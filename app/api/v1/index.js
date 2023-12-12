import { Router } from "express";
import { router as student } from "./student/routes.js";
import { router as auth } from "./auth/routes.js";
import { router as coursesOutcome } from "./coursesOutcomes/routes.js";

export const router = Router();

//router.use("/resultadoAsignatura", coursesOutcome);
//router.use("/estudiantes", student);
router.use("/auth", auth);
