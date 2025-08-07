import { z } from 'zod';

const login = z.object({
  body: z.object({
    contactNo: z.string({
      message: `contactNo is required`,
    }),
    password: z.string({
      message: `user password is required`,
    }),
  }),
});

const refreshToken = z.object({
  cookies: z.object({
    refreshToken: z.string({
      message: `refresh token is required`,
    }),
  }),
});

const changePassword = z.object({
  body: z.object({
    oldPassword: z.string({
      message: `old password is required`,
    }),
    newPassword: z.string({
      message: `new password is required`,
    }),
  }),
});

const resetPasswordReq = z.object({
  body: z.object({
    email: z.string({
      message: `old password is required`,
    }).email({message: `invalid email address`})
  }),
});


const checkOTPValidation = z.object({
  body: z.object({
    email: z.string({
      message: `old password is required`,
    }).email({message: `invalid email address`}),
    otp: z.number({message: "otp is required"}).min(6).max(6),
  }),
})

const resetPassword = z.object({
  body: z.object({
    email: z.string({
      message: `old password is required`,
    }).email({message: `invalid email address`}),
    otp: z.number({message: "otp is required"}).min(6).max(6),
    password: z.string({message: `password is required`})
  }),
})

export const AuthValidator = { login, refreshToken, changePassword, resetPasswordReq, checkOTPValidation,resetPassword };
