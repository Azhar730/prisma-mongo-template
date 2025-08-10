import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ContactServices } from "./contact.service";
import httpStatus from "http-status";

const postContact = catchAsync(async (req, res) => {
    const user = req.user;
    if (!user || typeof user !== "object") {
        throw new Error("User information is missing or invalid.");
    }
    const result = await ContactServices.postContactIntoDB(req.body, user);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `Message sent successfully`,
        data: result,
    });
})

export const ContactControllers = {
    postContact,
}