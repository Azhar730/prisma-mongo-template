import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router()

router.post("/register", UserController.registerUser)
router.post("/create-admin", UserController.createAdmin)
router.get("/", UserController.getAllUser)

export const UserRoutes = router;