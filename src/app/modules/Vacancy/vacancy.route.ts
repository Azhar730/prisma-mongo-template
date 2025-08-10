import { Router } from "express";
import { VacancyControllers } from "./vacancy.controller";

const router = Router()

router.post('/create-vacancy', VacancyControllers.createVacancy);
router.get('/', VacancyControllers.getAllVacancy);
router.get('/latest-vacancies', VacancyControllers.getLatest3Vacancies);

export const VacancyRoutes = router;