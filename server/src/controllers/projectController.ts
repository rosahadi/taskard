import { PrismaClient } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import currentUser from '../utils/currentUser';
import { createProjectSchema } from '../schemas/project';
import { validateRequest } from '../utils/validateRequest';

const prisma = new PrismaClient();

// Project Controllers
export const createProject = catchAsync(async (req, res, next) => {
  validateRequest(req, { body: createProjectSchema });

  const user = await currentUser(req);
  const { name, description, startDate, endDate, workspaceId } = req.body;

  // Check if user is member of workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: user.id,
    },
  });

  if (!membership) {
    return next(new AppError('You are not a member of this workspace', 403));
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      startDate,
      endDate,
      workspaceId,
      creatorId: user.id,
    },
    include: {
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
      workspace: {
        select: {
          name: true,
        },
      },
    },
  });

  res.status(201).json({
    status: 'success',
    data: project,
  });
});
