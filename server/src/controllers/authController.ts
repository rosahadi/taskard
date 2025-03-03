import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { PrismaClient, User } from '@prisma/client';
import passport from 'passport';
import dotenv from 'dotenv';
import catchAsync from '../utils/catchAsync';
import {
  forgotPasswordSchema,
  loginSchema,
  signupSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  verifyEmailSchema,
} from '../schemas/auth';
import AppError from '../utils/appError';
import {
  comparePassword,
  generateAndHashToken,
  hashPassword,
} from '../utils/auth';
import { createSendToken } from '../utils/createSendToken';
import { sendPasswordResetEmail, sendVerificationEmail } from '../email/email';
import currentUser from '../utils/currentUser';
import { createDefaultWorkspace } from './workspaceController';
import { validateRequest } from '../utils/validateRequest';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Sign up a new user
 * @route POST /api/v1/users/signup
 * @param req - Express request object with user signup data
 * @param res - Express response object
 * @param next - Express next function
 */
export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    validateRequest(req, { body: signupSchema.shape.body });

    const { name, email, password } = req.body;

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
  }
);

/**
 * Verify user email with token
 * @route GET /api/v1/users/verify/:token
 * @param req - Express request object with verification token
 * @param res - Express response object
 * @param next - Express next function
 */
export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request params
    validateRequest(req, { params: verifyEmailSchema.shape.params });

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
          'Verification token has expired. Please signup again.',
          400
        )
      );
    }

    // Update user and create workspace
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null,
          verificationExpires: null,
        },
      });

      await createDefaultWorkspace(user);
    });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  }
);

/**
 * Initiate Google OAuth authentication
 * @route GET /api/v1/users/google
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })(req, res, next);
};

/**
 * Handle Google OAuth callback
 * @route GET /api/v1/users/google/callback
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const googleAuthCallback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'google',
      { session: false },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (err: Error, user: User, info: any) => {
        if (err) {
          return next(
            new AppError(`Authentication failed: ${err.message}`, 401)
          );
        }

        if (!user) {
          return next(
            new AppError('No user found with these credentials', 401)
          );
        }

        // Check if this is a new user (just created via OAuth)
        if (info?.isNewUser) {
          await createDefaultWorkspace(user);
        }

        // Set JWT in cookies
        createSendToken(user, 200, res);
      }
    )(req, res, next);
  }
);

/**
 * Login user with email and password
 * @route POST /api/v1/users/login
 * @param req - Express request object with login credentials
 * @param res - Express response object
 * @param next - Express next function
 */
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    validateRequest(req, { body: loginSchema.shape.body });

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Dummy password comparison to prevent timing attacks
    const fakeHash =
      '$2a$12$wR.wFj0wWzL.P8Mg1OlTAuFY/U1wN/3X3FZpOq9uFbSkZFPJ5Xh7O';

    if (!user) {
      await comparePassword(password, fakeHash); // Ensures consistent timing
      return next(new AppError('Incorrect email or password', 401));
    }

    // Prevent password login for OAuth users
    if (user.provider && user.providerId) {
      return next(
        new AppError(
          `This email is associated with ${user.provider} login. Please use ${user.provider} to sign in.`,
          400
        )
      );
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
  }
);

/**
 * Logout user by clearing JWT cookie
 * @route GET /api/v1/users/logout
 * @param req - Express request object
 * @param res - Express response object
 */
export const logout = (_req: Request, res: Response) => {
  // Clear the JWT from the cookie
  res.cookie('jwt', '', {
    expires: new Date(0),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

/**
 * Send password reset email with token
 * @route POST /api/v1/users/forgot-password
 * @param req - Express request object with user email
 * @param res - Express response object
 * @param next - Express next function
 */
export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    validateRequest(req, { body: forgotPasswordSchema.shape.body });

    const { email } = req.body;

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
  }
);

/**
 * Reset user password with token
 * @route POST /api/v1/users/reset-password/:token
 * @param req - Express request object with reset token and new password
 * @param res - Express response object
 * @param next - Express next function
 */
export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request
    validateRequest(req, {
      params: resetPasswordSchema.shape.params,
      body: resetPasswordSchema.shape.body,
    });

    const { token } = req.params;
    const { password } = req.body;

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
        passwordChangedAt: new Date(),
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully',
    });
  }
);

/**
 * Update authenticated user's password
 * @route PATCH /api/v1/users/update-password
 * @param req - Express request object with current and new password
 * @param res - Express response object
 * @param next - Express next function
 */
export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User is not authenticated', 401));
    }

    // Validate request body
    validateRequest(req, { body: updatePasswordSchema.shape.body });

    const { currentPassword, password } = req.body;

    const user = req.user as User;

    // Fetch user with password
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!dbUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if current password is correct
    const isMatch = await comparePassword(currentPassword, dbUser.password);
    if (!isMatch) {
      return next(new AppError('Incorrect current password', 401));
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, passwordChangedAt: new Date() },
    });

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  }
);

/**
 * Middleware to protect routes - validates user authentication
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get current user
    const user = await currentUser(req);

    const safeUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        passwordChangedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!safeUser) {
      return next(new AppError('User not found', 404));
    }

    // Only add the safe user
    req.user = safeUser;
    res.locals.user = safeUser;

    next();
  }
);

/**
 * Background job to clean up unverified users with expired tokens
 */
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
