import { ApplyVacancy, UserStatus } from "@prisma/client";
import { Jwt, JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError";

const applyVacancy = async (payload: ApplyVacancy, user: JwtPayload) => {
    // check user exists
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
            status: UserStatus.ACTIVE,
        },
    });
    if (!userData) {
        throw new ApiError(404, "User not found!");
    }
    // check vacancy exists
    const vacancy = await prisma.vacancy.findUnique({
        where: {
            id: payload.vacancyId,
        },
    })
    if (!vacancy) {
        throw new ApiError(404, "Vacancy not found!");
    }
    // already applied for this vacancy
    const existingApplication = await prisma.applyVacancy.findFirst({
        where: {
            userId: userData.id,
            vacancyId: payload.vacancyId,
        },
    })
    if (existingApplication) {
        throw new ApiError(409, "You have already applied for this vacancy.");
    }
    
    payload.userId = userData.id;
    payload.firstName = userData.firstName;
    payload.lastName = userData.lastName;
    payload.emailAddress = userData.email;
    const result = await prisma.applyVacancy.create({
        data: {
            ...payload,
        },
    })
    return result;

}

const getMyVacancies = async(user: JwtPayload) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.id,
            status: UserStatus.ACTIVE,
        },
    });
    if (!userData) {
        throw new ApiError(404, "User not found!");
    }
    const result = await prisma.applyVacancy.findMany({
        where: {
            userId: userData.id,
        },
        include: {
            vacancy: true,
        },
    });
    return result;
}


export const ApplyVacancyServices = {
    applyVacancy,
    getMyVacancies
}