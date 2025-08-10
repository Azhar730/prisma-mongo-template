import { Contact } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { JwtPayload } from "jsonwebtoken";

const postContactIntoDB = async (contactData:Contact,user:JwtPayload) => {
    const userName = user.firstName + " " + user.lastName;
    contactData.name = userName;
    contactData.email = user.email;
    const contact = await prisma.contact.create({
        data: contactData,
    });
    return contact;
}

export const ContactServices = {
    postContactIntoDB
}