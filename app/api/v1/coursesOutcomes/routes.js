import { Router } from "express";
import * as controller from "./controller.js";

export const router = Router();

/**
 * /api/v1/resultadoAsignatura POST-CREATE
 * /api/v1/resultadoAsignatura GET -READ ALL
 * /api/v1/resultadoAsignatura/:id GET -READ ONE
 * /api/v1/resultadoAsignatura/:id PUT -UPDATE ONE
 * /api/v1/resultadoAsignatura/:id PATCH -UPDATE PART ONE
 * /api/v1/resultadoAsignatura/:id DELETE -DELETE ONE
 */
router
  .route("/")
  .post(controller.createCoursesOutcome)
  .get(controller.allCoursesOutcome);

router
  .route("/:id")
  .get(controller.readCoursesOutcome)
  .put(controller.updateCoursesOutcome)
  .patch(controller.updateCoursesOutcome)
  .delete(controller.removeCoursesOutcome);
