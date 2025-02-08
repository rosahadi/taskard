import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import passport from 'passport';
import dotenv from 'dotenv';
import catchAsync from '../utils/catchAsync';
import { LoginSchema, registerSchema } from '../utils/auth-validations';
import AppError from '../utils/appError';
import { comparePassword, hashPassword } from '../utils/auth';
import { createSendToken } from '../utils/createSendToken';

dotenv.config();

const prisma = new PrismaClient();

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedData = registerSchema.safeParse(req.body);

    console.log(parsedData.error);
    if (!parsedData.success) {
      // Format and send errors from Zod validation
      const errorMessages = parsedData.error.errors.map((err) => err.message);
      return next(new AppError(errorMessages.join(', '), 400));
    }

    const { name, email, password } = parsedData.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email is already in use', 400));
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    createSendToken(newUser, 201, res);
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedData = LoginSchema.safeParse(req.body);
    if (!parsedData.success) {
      return next(new AppError('Invalid email or password', 400));
    }

    const { email, password } = parsedData.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Dummy password comparison to prevent timing attacks
    const fakeHash =
      '$2a$12$wR.wFj0wWzL.P8Mg1OlTAuFY/U1wN/3X3FZpOq9uFbSkZFPJ5Xh7O';

    if (!user) {
      await comparePassword(password, fakeHash); // Ensures consistent timing
      return next(new AppError('Incorrect email or password', 401));
    }

    if (!(await comparePassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
  }
);

export const logout = (req: Request, res: Response) => {
  // Clear the JWT from the cookie
  res.cookie('jwt', '', {
    expires: new Date(0),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

export const protect = (req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passport.authenticate('jwt', { session: false }, (err: any, user: User) => {
    if (err || !user) {
      console.log('Authentication failed:', err);
      return next(new AppError('You are not logged in! Please log in.', 401));
    }
    req.user = user;
    next();
  })(req, res, next);
};
