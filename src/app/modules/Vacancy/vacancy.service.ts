import { Vacancy } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createVacancyIntoDB = async (payload: Vacancy) => {
    const result = await prisma.vacancy.create({
        data: payload,
    })
    return result;
}

const getAllVacancyFromDB = async () => {
    const result = await prisma.vacancy.findMany()
    return result;
}

export const VacancyServices = {
    createVacancyIntoDB,
    getAllVacancyFromDB,
}