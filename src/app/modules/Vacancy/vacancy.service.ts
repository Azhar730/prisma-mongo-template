import { Vacancy } from "@prisma/client";
import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpers/queryBuilder";
import { IGenericResponse } from "../../../interfaces/common";
import ApiError from "../../../errors/ApiError";
import { JwtPayload } from "jsonwebtoken";
import { IFile } from "../../../interfaces/file";
import { fileUploader } from "../../../helpers/fileUploader";

const createVacancyIntoDB = async (payload: Vacancy, user: JwtPayload, companyLogoFile: IFile | null, vacancyImgFile: IFile | null) => {
    const userExist = await prisma.user.findUnique({
        where: { id: user.id },
    });
    if (!userExist) {
        throw new ApiError(404,"User not found");
    }

    if (companyLogoFile) {
        const uploadLogo = await fileUploader.uploadToCloudinary(companyLogoFile);
        payload.companyLogo = uploadLogo?.secure_url ?? "";
    }
    if (vacancyImgFile) {
        const uploadVacancyImg = await fileUploader.uploadToCloudinary(vacancyImgFile);
        payload.vacancyImg = uploadVacancyImg?.secure_url ?? "";
    }

    payload.userId = user.id;

    const result = await prisma.vacancy.create({
        data: payload,
    });
    return result;
};

const getAllVacancyFromDB = async (query: Record<string,any>): Promise<IGenericResponse<Vacancy[]>> => {
    const queryBuilder = new QueryBuilder(prisma.vacancy, query);
    const vacancies = await queryBuilder
        .range()
        .search(["title", "description"])
        .filter(["title","department", "type", "location"])
        .sort()
        .paginate()
        .fields()
        .execute();
    const meta = await queryBuilder.countTotal();
    if (!vacancies || vacancies.length === 0) {
        throw new ApiError(404, "No vacancies found");
    }
    return { meta, data: vacancies }
}


const getLatest3VacanciesFromDB = async () => {
    const result = await prisma.vacancy.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 3,
    });
    return result;
}

export const VacancyServices = {
    createVacancyIntoDB,
    getAllVacancyFromDB,
    getLatest3VacanciesFromDB,
}