import { PrismaClient, User } from '@prisma/client';
import * as z from 'zod';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { validateRequest } from '../utils/validateRequest';

const prisma = new PrismaClient();

// User schema for request validation
const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email').optional(),
    image: z.string().url('Invalid image URL').optional(),
  })
  .strict();

/**
 * Get currently authenticated user
 * @route GET /api/v1/users/me
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @param next - Express next function
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: req.user,
  });
});

/**
 * Update authenticated user's profile
 * @route PATCH /api/v1/users/updateMe
 * @param req - Express request object with update data
 * @param res - Express response object
 * @param next - Express next function
 */
export const updateMe = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('User is not authenticated', 401));
  }

  const user = req.user as User;

  // Validate the request body using Zod
  validateRequest(req, { body: updateUserSchema });

  const filteredBody = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: filteredBody,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * Delete authenticated user's account
 * @route DELETE /api/v1/users/deleteMe
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const deleteMe = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('User is not authenticated', 401));
  }

  const user = req.user as User;

  await prisma.user.delete({
    where: { id: user.id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
