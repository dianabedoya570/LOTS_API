import { Router } from "express";
import * as controller from "./controller.js";

export const router = Router();

/**
 * /api/v1/estudiante POST-CREATE
 * /api/v1/estudiante GET -READ ALL
 * /api/v1/estudiante/:id GET -READ ONE
 * /api/v1/estudiante/:id PUT -UPDATE ONE
 * /api/v1/estudiante/:id PATCH -UPDATE PART ONE
 * /api/v1/estudiante/:id DELETE -DELETE ONE
 */
router.route("/").post(controller.createStudent).get(controller.allStudents);

router
  .route("/:id")
  .get(controller.readStudent)
  .put(controller.updateStudent)
  .patch(controller.updateStudent)
  .delete(controller.removeStudent);
