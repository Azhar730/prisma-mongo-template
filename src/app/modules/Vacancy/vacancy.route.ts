import { Router } from "express";
import { VacancyControllers } from "./vacancy.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router()

router.post('/create-vacancy',auth(UserRole.ADMIN), VacancyControllers.createVacancy);
router.get('/', VacancyControllers.getAllVacancy);
router.get('/latest-vacancies', VacancyControllers.getLatest3Vacancies);

export const VacancyRoutes = router;