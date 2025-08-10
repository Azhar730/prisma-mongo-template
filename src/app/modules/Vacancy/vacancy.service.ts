import { Vacancy } from "@prisma/client";
import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpers/queryBuilder";
import { IGenericResponse } from "../../../interfaces/common";
import ApiError from "../../../errors/ApiError";
import { JwtPayload } from "jsonwebtoken";

const createVacancyIntoDB = async (payload: Vacancy,user: JwtPayload) => {
    // check if user exists
    const userExist = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
    })
    if (!userExist) {
        throw new ApiError(404,"User not found");
    }
    payload.userId = user.id;
    const result = await prisma.vacancy.create({
        data: payload,
    })
    return result;
}

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