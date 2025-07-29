import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errors";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: err.message,
    });
  }

  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong",
  });
};