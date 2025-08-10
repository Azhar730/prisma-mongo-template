import { Router } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../../helpers/fileUploader";
import textToJSONParser from "../../middlewares/textToJsonParser";

const router = Router()

router.post("/register", fileUploader.upload.single("file"),textToJSONParser, UserController.registerUser)
router.post("/create-admin", fileUploader.upload.single("file"),textToJSONParser, UserController.createAdmin)
router.get("/", UserController.getAllUser)

export const UserRoutes = router;