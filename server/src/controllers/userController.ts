import { PrismaClient, User } from '@prisma/client';
import * as z from 'zod';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

const prisma = new PrismaClient();

const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email').optional(),
    image: z.string().url('Invalid image URL').optional(),
  })
  .strict();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: req.user,
  });
});

// Update user profile
export const updateMe = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('User is not authenticated', 401));
  }

  const user = req.user as User;

  // Validate the request body using Zod
  const parsedBody = updateUserSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return next(new AppError(parsedBody.error.errors[0].message, 400));
  }

  const filteredBody = parsedBody.data;

  const updatedUser = await prisma.user.update({
    where: { email: user.email },
    data: filteredBody,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Delete user profile
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
