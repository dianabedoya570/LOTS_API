import { programs } from "./seeds/programs.js";
import { courses } from "./seeds/courses.js";
import { ratings } from "./seeds/ratings.js";
import { outcomes } from "./seeds/outcomes.js";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

async function main() {
  let res = 0;
  for (let course of courses) {
    await prisma.courses.create({
      data: course,
    });
  }
  for (let rating of ratings) {
    await prisma.rating_scale.create({
      data: rating,
    });
  }

  for (let program of programs) {
    res = await prisma.programs.create({
      data: program,
    });
    console.log(res);
  }
  for (let outcome of outcomes) {
    outcome.programsId = res.id;
    await prisma.student_outcomes.create({
      data: outcome,
    });
    console.log(res);
  }
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
