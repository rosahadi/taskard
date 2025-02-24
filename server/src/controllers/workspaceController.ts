import { PrismaClient, Role, User } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import currentUser from '../utils/currentUser';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas';
import { validateRequest } from '../utils/validateRequest';
import { z } from 'zod';

const prisma = new PrismaClient();

// Create new workspace
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createWorkspace = catchAsync(async (req, res, next) => {
  validateRequest(req, { body: createWorkspaceSchema });

  const user = await currentUser(req);

  const { name, image } = req.body;

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

// Create defualt workspace
export const createDefaultWorkspace = async (user: User) => {
  try {
    const workspaceName = `${user.name}'s Workspace`;

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
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

    return workspace;
  } catch {
    throw new Error('Failed to create workspace');
  }
};

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

// Update workspace
export const updateWorkspace = catchAsync(async (req, res, next) => {
  validateRequest(req, {
    body: updateWorkspaceSchema,
    params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid workspace ID') }),
  });

  const user = await currentUser(req);
  const { id } = req.params;
  const { name, image } = req.body;

  // Check if user is owner or admin
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: parseInt(id),
      userId: user.id,
      role: Role.ADMIN,
    },
  });
  const isOwner = await prisma.workspace.findFirst({
    where: {
      id: parseInt(id),
      ownerId: user.id,
    },
  });

  if (!membership && !isOwner) {
    return next(
      new AppError('You do not have permission to update this workspace', 403)
    );
  }

  const workspace = await prisma.workspace.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      image,
    },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: workspace,
  });
});

// Delete workspace
export const deleteWorkspace = catchAsync(async (req, res, next) => {
  const user = await currentUser(req);
  const { id } = req.params;

  // Only owner can delete workspace
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: parseInt(id),
      ownerId: user.id,
    },
  });

  if (!workspace) {
    return next(
      new AppError('Workspace not found or you are not the owner', 404)
    );
  }

  // Delete all members
  await prisma.workspaceMember.deleteMany({
    where: {
      workspaceId: parseInt(id),
    },
  });

  // Delete workspace
  await prisma.workspace.delete({
    where: {
      id: parseInt(id),
    },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
