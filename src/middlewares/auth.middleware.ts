import { NextFunction, Request, Response } from "express";
import { getUserData, IUserToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: IUserToken;
    }
  }
}

export interface IReqUser extends Response {
  user?: IUserToken;
}

export default (req: Request, res: Response, next: NextFunction): void => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(403).json({
      message: "Unauthorized!",
      data: null,
    });

    return;
  }

  const [prefix, token] = authorization.split(" ");

  if (!(prefix === "Bearer" && token)) {
    res.status(403).json({
      message: "Unauthorized!",
      data: null,
    });

    return;
  }

  const user = getUserData(token);

  if (!user) {
    res.status(403).json({
      message: "Unauthorized!",
      data: null,
    });

    return;
  }

  req.user = user;

  next();
};
