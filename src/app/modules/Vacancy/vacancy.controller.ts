import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { VacancyServices } from "./vacancy.service";
import httpStatus from "http-status";
import { IFile } from "../../../interfaces/file";

const createVacancy = catchAsync(async (req, res) => {
    const user = req.user;
    const files = req.files as {
      companyLogo?: Express.Multer.File[],
      vacancyImg?: Express.Multer.File[]
    };

    const companyLogoFile = files.companyLogo ? (files.companyLogo[0] as IFile) : null;
    const vacancyImgFile = files.vacancyImg ? (files.vacancyImg[0] as IFile) : null;

    const result = await VacancyServices.createVacancyIntoDB(req.body, user as JwtPayload, companyLogoFile, vacancyImgFile);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `Vacancy created successfully`,
        data: result,
    });
});
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