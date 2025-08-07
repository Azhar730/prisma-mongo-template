import httpStatus from "http-status";
import { JwtPayload, Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { templates } from "../../../helpers/templates";
import config from "../../../config";
import { EmailSender } from "../../../helpers/emailSender";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError";
import prismaWithExtensions from "../../middlewares/prismaWithExtension";
import { EmailTemplates } from "./emailTemplates";
import { JWTHelpers } from "../../../helpers/jwtHelper";
import { IChangePassword, ILogin, ILoginResponse, IRefreshTokenResponse } from "./auth.interface";
import { User, Verification } from "@prisma/client";

const verifyUser = async (data: Verification): Promise<User | null> => {
  const { email, otp } = data;

  const isUserExist = await prismaWithExtensions.user.isUserExists(email);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, `user not found`);
  }

  const isVerificationExist = await prisma.verification.findFirst({
    where: {
      otp,
      userId: isUserExist?.id!,
      email: isUserExist?.email!,
    },
  });

  if (!isVerificationExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid OTP");
  }

  const result = await prisma?.$transaction(async (transactionClient) => {
    const updateUser = await transactionClient.user.update({
      where: {
        id: isUserExist?.id,
      },
      data: {
        status: "ACTIVE",
      },
    });

    if (!updateUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User Updation Failed");
    }

    // delete verification
    const deleteVerification = await transactionClient.verification.delete({
      where: {
        id: isVerificationExist?.id,
      },
    });

    if (!deleteVerification) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "user verification deletion failed"
      );
    }

    return updateUser;
  });

  return result;
};

const resetPasswordRequest = async (contactNo: string) => {
  // is user exist
  const isUserExist = await prismaWithExtensions.user.isUserExists(contactNo);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, `user not found`);
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    // delete previous verifications
    await transactionClient?.verification?.deleteMany({
      where: {
        email: isUserExist?.email as string,
        userId: isUserExist?.id as string,
      },
    });

    // user verification creation
    const verificationCreation = await transactionClient.verification.create({
      data: {
        email: isUserExist?.email!,
        userId: isUserExist?.id!,
        otp: Math.floor(100000 + Math.random() * 900000),
      },
    });

    if (!verificationCreation) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "verification creation failed"
      );
    }

    if (verificationCreation) {
      await EmailSender.emailSender({
        email: verificationCreation.email,
        subject: "Eshofer - Password Reset",
        html: await EmailTemplates.temp1(Number(verificationCreation?.otp)),
      });
    }

    return verificationCreation;
  });

  return result;
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!userData) {
    throw new ApiError(404, "User not found");
  }

  const resetPassToken = JWTHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_expires_in as string
  );

  const resetPassLink =
    config.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;

  await EmailSender.emailSender({
    subject: "Reset Your Password",
    email: userData.email,
    html: templates.resetPassword(resetPassLink),
  });
  return {
    message: "Reset password link sent via your email successfully",
  };
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
    },
  });

  if (!userData) {
    throw new ApiError(404, "User not found");
  }

  const isValidToken = JWTHelpers.verifyToken(
    token,
    config.jwt.access_secret as Secret
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  // hash password
  const password = await bcrypt.hash(payload.password, 12);

  // update into database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });
  return { message: "Password reset successfully" };
};

const checkOTPValidation = async (data: Verification) => {
  const { email, otp } = data;

  const isUserExist = await prismaWithExtensions.user.isUserExists(email);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, `user not found`);
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const isVerificationExist = await transactionClient.verification.findFirst({
      where: {
        otp,
        userId: isUserExist?.id as string,
        email: isUserExist?.email as string,
      },
    });

    if (!isVerificationExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid OTP");
    }

    return isVerificationExist;
  });

  return result;
};

const login = async (data: ILogin): Promise<ILoginResponse> => {
  const { email, password } = data;

  const isUserExist = await prismaWithExtensions.user.isUserExists(email);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, `user not found`);
  }

  const isPasswordMatched = await prismaWithExtensions.user.isPasswordMatched(
    password,
    isUserExist.password!
  );

  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, `password is incorrect`);
  }

  const accessToken = JWTHelpers.generateToken(
    {
      id: isUserExist?.id,
      email: isUserExist?.email,
      role: isUserExist?.role,
      name: isUserExist?.userName,
    //   avatar: isUserExist?.avatar,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  const refreshToken = JWTHelpers.generateToken(
    {
      id: isUserExist?.id,
      email: isUserExist?.email,
      role: isUserExist?.role,
      name: isUserExist?.userName,
    },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  // verify token
  let verifiedToken = null;
  try {
    verifiedToken = JWTHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, `invalid refresh token`);
  }

  const { email } = verifiedToken;

  // check is user deleted or not on database
  const isUserExist = await prismaWithExtensions.user.isUserExists(email);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, `user not found`);
  }
  // generate new Token
  const newAccessToken = JWTHelpers.generateToken(
    {
      id: isUserExist.id,
      email: isUserExist.email,
      role: isUserExist.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  return { accessToken: newAccessToken };
};

const changePassword = async (
  userData: JwtPayload | null,
  passwordData: IChangePassword
): Promise<{ message: string }> => {
  const { email } = userData!;
  const { oldPassword, newPassword } = passwordData!;

  // checking is user exists
  const isUserExist = await prismaWithExtensions.user.isUserExists(email);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, `user not found`);
  }

  if (
    isUserExist.password &&
    !(await prismaWithExtensions.user.isPasswordMatched(
      oldPassword,
      isUserExist.password
    ))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, `old password is incorrect`);
  }

  const newHashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bycrypt_salt_rounds)
  );

  const updatedData = {
    password: newHashPassword,
  };

  await prisma.user.update({
    where: {
      id: isUserExist.id,
    },
    data: updatedData,
  });

  return { message: `password changed successfully` };
};

const googleOauthLogin = async (user: any) => {
  // Check if the user exists
  let isUserExist = await prisma.user.findUnique({
    where: { email: user?.email }, // Find user by email
  });

  if (!isUserExist) {
    // Create a new user if one does not exist

    isUserExist = await prisma.user.create({
      data: {
        ...user,
      },
    });
  }

  // Generate JWT for the logged-in user
  const jwtPayload = {
    id: isUserExist?.id,
    email: isUserExist?.email,
    role: isUserExist?.role,
  };

  const accessToken = JWTHelpers.generateToken(
    jwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string
  );

  const refreshToken = JWTHelpers.generateToken(
    {
      id: isUserExist?.id,
      email: isUserExist?.email,
      role: isUserExist?.role,
    },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const appleOauthLogin = async (user: any) => {
  // Check if the user exists
  let isUserExist = await prisma.user.findUnique({
    where: { email: user?.email }, // Find user by email
  });

  if (!isUserExist) {
    // Create a new user if one does not exist

    isUserExist = await prisma.user.create({
      data: {
        ...user,
      },
    });
  }

  // Generate JWT for the logged-in user
  const jwtPayload = {
    id: isUserExist?.id,
    email: isUserExist?.email,
    role: isUserExist?.role,
  };

  const accessToken = JWTHelpers.generateToken(
    jwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string
  );

  const refreshToken = JWTHelpers.generateToken(
    {
      id: isUserExist?.id,
      email: isUserExist?.email,
      role: isUserExist?.role,
    },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  login,
  refreshToken,
  changePassword,
  checkOTPValidation,
  verifyUser,
  resetPasswordRequest,
  resetPassword,
  googleOauthLogin,
  appleOauthLogin,
  forgotPassword,
};
