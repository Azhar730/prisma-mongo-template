import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserServices } from "./user.service";
import httpStatus from "http-status";

const createUser = catchAsync(async (req, res) => {
    const result = await UserServices.createUserIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `User created successfully`,
        data: result,
    });
})

export const UserController = {
    createUser
}