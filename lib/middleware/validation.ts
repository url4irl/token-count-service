import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validate = (
  schema: z.ZodObject<any, any>,
  target: "body" | "query" | "params"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[target]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          errors: error.issues,
        });
      } else {
        next(error);
      }
    }
  };
};