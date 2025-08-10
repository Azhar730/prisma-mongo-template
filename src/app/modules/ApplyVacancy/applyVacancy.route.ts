import { Router } from "express";
import { ApplyVacancyControllers } from "./applyVacancy.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = Router()

router.post("/apply",auth(UserRole.USER), ApplyVacancyControllers.applyVacancy);
router.get("/my-vacancies",auth(UserRole.USER), ApplyVacancyControllers.getMyVacancies);

export const ApplyVacancyRoutes = router;