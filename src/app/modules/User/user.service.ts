import { User } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { IGenericResponse } from "../../../interfaces/common";
import QueryBuilder from "../../../helpers/queryBuilder";
import bcrypt from "bcrypt";
import { IFile } from "../../../interfaces/file";
import { fileUploader } from "../../../helpers/fileUploader";

const registerUserIntoDB = async (payload: User, file: IFile) => {
    console.log("payload", payload);
    const user = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    })
    
    if (user) {
        throw new ApiError(httpStatus.CONFLICT, "User already exists");
    }
    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        payload.photoUrl = uploadToCloudinary?.secure_url ?? null;
    }
    const hashedPassword: string = await bcrypt.hash(payload.password, 12);
    payload.password = hashedPassword;
    const result = await prisma.user.create({
        data: payload,
    });
    return result;
}
const createAdminIntoDB = async (payload: User,file: IFile) => {
    const user = await prisma.user.findUnique({
        where: {
            email: payload?.email,
        },
    })
    if (user) {
        throw new ApiError(httpStatus.CONFLICT, "User already exists");
    }
    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        payload.photoUrl = uploadToCloudinary?.secure_url ?? null;
    }
    payload.role = "ADMIN";
    const hashedPassword: string = await bcrypt.hash(payload.password, 12);
    payload.password = hashedPassword;
    const result = await prisma.user.create({
        data: payload,
    });
    return result;
}
const getAllUserFromDB = async (query: Record<string, any>): Promise<IGenericResponse<User[]>> => {
    const queryBuilder = new QueryBuilder(prisma.user, query);
    const users = await queryBuilder
        .range()
        .search(["firstName", "email"])
        .filter()
        .sort()
        .paginate()
        .fields()
        .execute();
    const meta = await queryBuilder.countTotal();
    return { meta, data: users }
}

export const UserServices = {
    registerUserIntoDB,
    getAllUserFromDB,
    createAdminIntoDB
}