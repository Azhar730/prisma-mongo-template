import { Router } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../../helpers/fileUploader";

const router = Router()

router.post("/register", fileUploader.upload.single("file"), UserController.registerUser)
router.post("/create-admin", fileUploader.upload.single("file"), UserController.createAdmin)
router.get("/", UserController.getAllUser)

export const UserRoutes = router;