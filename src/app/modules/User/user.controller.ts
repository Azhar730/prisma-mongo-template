import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserServices } from "./user.service";
import httpStatus from "http-status";

const registerUser = catchAsync(async (req, res) => {
    const result = await UserServices.registerUserIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `User registered successfully`,
        data: result,
    });
})
const createAdmin = catchAsync(async (req, res) => {
    const result = await UserServices.createAdminIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `Admin created successfully`,
        data: result,
    });
})
const getAllUser = catchAsync(async (req, res) => {
    const result = await UserServices.getAllUserFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `Users retrived successfully`,
        meta: result.meta,
    data: result.data,
    });
})

export const UserController = {
    registerUser,
    getAllUser,
    createAdmin
}