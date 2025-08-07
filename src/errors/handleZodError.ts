import { ZodError, ZodIssue } from "zod";
import { IGenericErrorResponse } from "../interfaces/common";
import { IGenericErrorMessage } from "../interfaces/error";

const handleZodError = (error: ZodError): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = error.issues.map(
    (issue: ZodIssue): IGenericErrorMessage => {
      const path = issue.path[issue.path.length - 1];

      return {
        path: typeof path === "string" || typeof path === "number" ? path : "unknown",
        message: issue.message,
      };
    }
  );

  const statusCode = 400;

  return {
    statusCode,
    message: "Validation Error",
    errorMessages: errors,
  };
};

export default handleZodError;

// import { ZodError, ZodIssue } from "zod";
// import { IGenericErrorResponse } from "../interfaces/common";
// import { IGenericErrorMessage } from "../interfaces/error";


// const handleZodError = (error: ZodError): IGenericErrorResponse => {
//   const errors: IGenericErrorMessage[] = error.issues.map((issue: ZodIssue) => {
//     return {
//       path: issue?.path[issue.path.length - 1],
//       message: issue?.message,
//     };
//   });

//   const statusCode = 400;

//   return {
//     statusCode,
//     message: "Validation Error",
//     errorMessages: errors,
//   };
// };

// export default handleZodError;