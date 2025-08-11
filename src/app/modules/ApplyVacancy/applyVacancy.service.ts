import { ApplyVacancy, UserStatus } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError";
import { IFile } from "../../../interfaces/file";
import { fileUploader } from "../../../helpers/fileUploader";

const applyVacancy = async (payload: ApplyVacancy, user: JwtPayload, file: IFile) => {
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
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    payload.cvLink = uploadToCloudinary?.secure_url ?? ""
    payload.userId = userData.id;
    payload.firstName = userData.firstName;
    payload.lastName = userData.lastName
    payload.emailAddress = userData.email;
    const result = await prisma.applyVacancy.create({
        data: {
            ...payload,
        },
    })
    console.log("result", result);
    return result;

}



const getMyVacancies = async (user: JwtPayload) => {
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