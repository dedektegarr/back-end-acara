import type { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";

type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().required(),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Password not match"),
});

export default {
  async register(req: Request, res: Response) {
    /**
      #swagger.tags = ["Auth"]
    */

    const { fullName, username, email, password, confirmPassword } =
      req.body as TRegister;

    try {
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      });

      res.status(200).json({
        message: "Success registration!",
        data: result,
      });
    } catch (error) {
      const err = error as Error;

      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    /**
      #swagger.tags = ["Auth"]
    
      #swagger.requestBody = {
        required: true,
        schema: {$ref: "#/components/schemas/LoginRequest"}
      }
    */

    const { identifier, password } = req.body as TLogin;

    try {
      const userByIdentifier = await UserModel.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      });

      if (!userByIdentifier) {
        res.status(403).json({
          message: "User not found",
          data: null,
        });
        return;
      }

      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        res.status(403).json({
          message: "User not found",
          data: null,
        });
        return;
      }

      // generate token
      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      res.status(200).json({
        message: "Login success",
        data: { token },
      });
    } catch (error) {
      const err = error as Error;

      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  async user(req: Request, res: Response): Promise<void> {
    /**
      #swagger.tags = ["Auth"]
      #swagger.security = [{
        "bearerAuth": []
      }]
    */

    try {
      const user = await UserModel.findById(req.user?.id);

      res.status(200).json({
        message: "Success get user profile",
        data: user,
      });
    } catch (error) {
      const err = error as Error;

      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
};
