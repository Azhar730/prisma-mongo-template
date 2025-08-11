import { Router } from "express";
import { VacancyControllers } from "./vacancy.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploader";
import textToJSONParser from "../../middlewares/textToJsonParser";

const router = Router()

router.post('/create-vacancy', auth(UserRole.ADMIN), fileUploader.upload.fields([
    { name: 'companyLogo', maxCount: 1 },
    { name: 'vacancyImg', maxCount: 1 }
  ]), textToJSONParser, VacancyControllers.createVacancy);
router.get('/', VacancyControllers.getAllVacancy);
router.get('/latest-vacancies', VacancyControllers.getLatest3Vacancies);

export const VacancyRoutes = router;