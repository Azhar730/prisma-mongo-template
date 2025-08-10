import { Router } from "express";
import { UserRoutes } from "../modules/User/user.route";
import { ContactRoutes } from "../modules/contact/contact.route";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { VacancyRoutes } from "../modules/Vacancy/vacancy.route";
import { ApplyVacancyRoutes } from "../modules/ApplyVacancy/applyVacancy.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/contact",
    route: ContactRoutes,
  },
  {
    path: "/vacancy",
    route: VacancyRoutes,
  },
  {
    path: "/apply-vacancy",
    route: ApplyVacancyRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;