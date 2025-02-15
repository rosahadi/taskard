import { PrismaClient, User } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import filterObj from '../utils/filterObj';

const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: req.user,
  });
});

// Update user profile
export const updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (!req.user) {
    return next(new AppError('User is not authenticated', 401));
  }

  const user = req.user as User;

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
