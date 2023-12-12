import { prisma } from "../../../database.js";

export const createCoursesOutcome = async (req, res) => {
  const { body } = req;
  const result = await prisma.courses_outcomes.create({
    data: body,
  });
  res.json({
    data: result,
  });
};

export const allCoursesOutcome = (req, res) => {
  res.json({
    data: [],
  });
};

export const readCoursesOutcome = (req, res) => {
  res.json({
    data: {},
  });
};

export const updateCoursesOutcome = (req, res) => {
  res.json({
    data: {},
  });
};

export const removeCoursesOutcome = (req, res) => {
  res.status(204);
  res.end();
};
