import { prisma } from "../../../database.js";

export const createStudent = async (req, res) => {
  const { body } = req;
  const result = await prisma.student.create({
    data: body,
  });
  res.json({
    data: result,
  });
};

export const allStudents = (req, res) => {
  res.json({
    data: [],
  });
};

export const readStudent = (req, res) => {
  res.json({
    data: {},
  });
};

export const updateStudent = (req, res) => {
  res.json({
    data: {},
  });
};

export const removeStudent = (req, res) => {
  res.status(204);
  res.end();
};
