import { Request, Response, NextFunction } from 'express';

type ControllerMethod = (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;

export const tryCatch = (fn: ControllerMethod) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};
