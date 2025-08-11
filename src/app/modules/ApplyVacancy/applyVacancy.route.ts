import { Router } from "express";
import { ApplyVacancyControllers } from "./applyVacancy.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploader";
import textToJSONParser from "../../middlewares/textToJsonParser";

const router = Router()

router.post("/apply",auth(UserRole.USER), fileUploader.upload.single("file"),textToJSONParser, ApplyVacancyControllers.applyVacancy);
router.get("/my-vacancies",auth(UserRole.USER), ApplyVacancyControllers.getMyVacancies);

export const ApplyVacancyRoutes = router;