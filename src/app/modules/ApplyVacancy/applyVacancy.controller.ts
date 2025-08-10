import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ApplyVacancyServices } from "./applyVacancy.service";
import httpStatus from "http-status";

const applyVacancy = catchAsync(async (req, res) => {
    const user = req.user;
    if (!user || typeof user !== "object") {
        throw new Error("User information is missing or invalid.");
    }
    const result = await ApplyVacancyServices.applyVacancy(req.body, user);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `Apply in vacancy successfully`,
        data: result,
    });
})
const getMyVacancies = catchAsync(async (req, res) => {
    const user = req.user;
    if (!user || typeof user !== "object") {
        throw new Error("User information is missing or invalid.");
    }
    const result = await ApplyVacancyServices.getMyVacancies(user);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `My vacancies retrieved successfully`,
        data: result,
    });
})

export const ApplyVacancyControllers = {
    applyVacancy,
    getMyVacancies,
}