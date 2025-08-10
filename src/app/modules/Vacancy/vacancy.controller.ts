import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { VacancyServices } from "./vacancy.service";
import httpStatus from "http-status";

const createVacancy = catchAsync(async (req, res) => {
    const result = await VacancyServices.createVacancyIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `Vacancy created successfully`,
        data: result,
    });
})
const getAllVacancy = catchAsync(async (req, res) => {
    const result = await VacancyServices.getAllVacancyFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `Vacancies retrieved successfully`,
        data: result,
    });
})

const getLatest3Vacancies = catchAsync(async (req, res) => {
    const result = await VacancyServices.getLatest3VacanciesFromDB();
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `Latest 3 vacancies retrieved successfully`,
        data: result,
    });
})

export const VacancyControllers = {
    createVacancy,
    getAllVacancy,
    getLatest3Vacancies,
}