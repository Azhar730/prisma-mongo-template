import { Router } from "express";
import { VacancyControllers } from "./vacancy.controller";

const router = Router()

router.post('/create-vacancy', VacancyControllers.createVacancy);
router.get('/', VacancyControllers.getAllVacancy);

export const VacancyRoutes = router;