import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import passport from 'passport';
import dotenv from 'dotenv';
import catchAsync from '../utils/catchAsync';
import { LoginSchema, registerSchema } from '../utils/auth-validations';
import AppError from '../utils/appError';
import { comparePassword, hashPassword } from '../utils/auth';
import { createSendToken } from '../utils/createSendToken';
import { createVerificationToken } from '../utils/createVerificationToken';
import { sendVerificationEmail } from '../email/email';

dotenv.config();

const prisma = new PrismaClient();

export const register = catchAsync(async (req, res, next) => {
  const parsedData = registerSchema.safeParse(req.body);

  console.log(parsedData.error);
  if (!parsedData.success) {
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

  // Create verification token and send verification email
  const verificationToken = await createVerificationToken(newUser.id);
  await sendVerificationEmail(email, name, verificationToken);

  createSendToken(newUser, 201, res);
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (!user) {
    return next(new AppError('Invalid verification token', 400));
  }

  if (user.verificationExpires && user.verificationExpires < new Date()) {
    // Delete the user if verification has expired
    await prisma.user.delete({
      where: { id: user.id },
    });
    return next(
      new AppError(
        'Verification token has expired. Please register again.',
        400
      )
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationExpires: null,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully',
  });
});

export const login = catchAsync(async (req, res, next) => {
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

  // Check if email is verified
  if (!user.emailVerified) {
    return next(
      new AppError('Please verify your email before logging in', 401)
    );
  }

  if (!(await comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

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

// Scheduled task to clean up unverified users
export const cleanupUnverifiedUsers = async () => {
  try {
    const result = await prisma.user.deleteMany({
      where: {
        AND: [
          { emailVerified: false },
          { verificationExpires: { lt: new Date() } },
        ],
      },
    });
    console.log(`Cleaned up ${result.count} unverified users`);
  } catch (error) {
    console.error('Error cleaning up unverified users:', error);
  }
};
