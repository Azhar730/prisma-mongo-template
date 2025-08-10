import { Router } from "express";
import { ContactControllers } from "./contact.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/post-contact",auth(UserRole.USER), ContactControllers.postContact);


export const ContactRoutes = router;