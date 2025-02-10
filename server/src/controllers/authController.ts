import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { PrismaClient, User } from '@prisma/client';
import passport from 'passport';
import dotenv from 'dotenv';
import catchAsync from '../utils/catchAsync';
import {
  ForgotPasswordSchema,
  LoginSchema,
  registerSchema,
  ResetPasswordSchema,
} from '../utils/auth-validations';
import AppError from '../utils/appError';
import {
  comparePassword,
  generateAndHashToken,
  hashPassword,
} from '../utils/auth';
import { createSendToken } from '../utils/createSendToken';
import { sendPasswordResetEmail, sendVerificationEmail } from '../email/email';

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
  const { token, hashedToken } = generateAndHashToken();
  const verificationExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: newUser.id },
    data: {
      verificationToken: hashedToken,
      verificationExpires,
    },
  });

  // Send the verification link to the user's email
  await sendVerificationEmail(email, name, token);

  createSendToken(newUser, 201, res);
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findUnique({
    where: { verificationToken: hashedToken },
  });

  if (!user) {
    return next(new AppError('Invalid verification token', 400));
  }

  // Delete the user if verification has expired
  if (user.verificationExpires && user.verificationExpires < new Date()) {
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
    const errorMessages = parsedData.error.errors.map((err) => err.message);
    return next(new AppError(errorMessages.join(', '), 400));
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

export const forgotPassword = catchAsync(async (req, res, next) => {
  const parsedData = ForgotPasswordSchema.safeParse(req.body);

  if (!parsedData.success) {
    const errorMessages = parsedData.error.errors.map((err) => err.message);
    return next(new AppError(errorMessages.join(', '), 400));
  }

  const { email } = parsedData.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  // Generate and hash password reset token
  const { token, hashedToken } = generateAndHashToken();
  const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: resetExpires,
    },
  });

  // Send the reset link to the user's email
  await sendPasswordResetEmail(user.email, user.name, token);

  res.status(200).json({
    status: 'success',
    message: 'Password reset link sent to email!',
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const parsedData = ResetPasswordSchema.safeParse(req.body);

  if (!parsedData.success) {
    const errorMessages = parsedData.error.errors.map((err) => err.message);
    return next(new AppError(errorMessages.join(', '), 400));
  }

  const { token } = req.params;
  const { password } = parsedData.data;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { email: user.email },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Password has been reset successfully',
  });
});

export const protect = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'jwt',
    { session: false },
    async (err: Error, user: User) => {
      if (err || !user) {
        console.log('Authentication failed:', err);
        return next(new AppError('You are not logged in! Please log in.', 401));
      }

      // Fetch user from database excluding the password field
      const safeUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!safeUser) {
        return next(new AppError('User not found', 404));
      }

      // Only add the safe user to the req.user
      req.user = safeUser;

      next();
    }
  )(req, res, next);
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
