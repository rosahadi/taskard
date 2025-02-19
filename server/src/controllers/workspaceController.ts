import { PrismaClient, Role } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import currentUser from '../utils/currentUser';
import { createWorkspaceSchema } from '../schemas';

const prisma = new PrismaClient();

// Create new workspace
export const createWorkspace = catchAsync(async (req, res, next) => {
  const user = await currentUser(req);

  const parsedData = createWorkspaceSchema.safeParse(req.body);
  if (!parsedData.success) {
    const errorMessages = parsedData.error.errors.map((err) => err.message);
    return next(new AppError(errorMessages.join(', '), 400));
  }

  const { name, image } = parsedData.data;

  // Create workspace with owner
  const workspace = await prisma.workspace.create({
    data: {
      name,
      image,
      ownerId: user.id,
      // Add creator as admin member
      members: {
        create: {
          userId: user.id,
          role: Role.ADMIN,
        },
      },
    },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  res.status(201).json({
    status: 'success',
    data: workspace,
  });
});

// Get all workspaces the user owns or is a member of
export const getAllWorkspaces = catchAsync(async (req, res, next) => {
  const user = await currentUser(req);

  const workspaces = await prisma.workspace.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!workspaces) {
    return next(new AppError('Workspaces not found or access denied', 404));
  }

  res.status(200).json({
    status: 'success',
    data: workspaces,
  });
});

// Get single workspace
export const getWorkspace = catchAsync(async (req, res, next) => {
  const user = await currentUser(req);
  const { id } = req.params;

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: parseInt(id),
      OR: [
        { ownerId: user.id },
        {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      ],
    },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!workspace) {
    return next(new AppError('Workspace not found or access denied', 404));
  }

  res.status(200).json({
    status: 'success',
    data: workspace,
  });
});
