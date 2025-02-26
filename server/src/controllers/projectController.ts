import { PrismaClient } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import currentUser from '../utils/currentUser';
import {
  createProjectSchema,
  deleteProjectSchema,
  getAllProjectsSchema,
  getProjectSchema,
  updateProjectSchema,
} from '../schemas/project';
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
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
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

export const getAllProjects = catchAsync(async (req, res, next) => {
  validateRequest(req, { params: getAllProjectsSchema });

  const user = await currentUser(req);
  const { workspaceId } = req.params;

  // Check workspace membership
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: parseInt(workspaceId),
      userId: user.id,
    },
  });

  if (!membership) {
    return next(new AppError('You are not a member of this workspace', 403));
  }

  const projects = await prisma.project.findMany({
    where: {
      workspaceId: parseInt(workspaceId),
    },
    include: {
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: { tasks: true },
      },
    },
  });

  res.status(200).json({
    status: 'success',
    data: projects,
  });
});

export const getProject = catchAsync(async (req, res, next) => {
  validateRequest(req, { params: getProjectSchema });

  const user = await currentUser(req);
  const { projectId } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id: parseInt(projectId),
      workspace: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    include: {
      tasks: {
        include: {
          assignees: {
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
      },
    },
  });

  if (!project) {
    return next(new AppError('Project not found or access denied', 404));
  }

  res.status(200).json({
    status: 'success',
    data: project,
  });
});

export const updateProject = catchAsync(async (req, res, next) => {
  validateRequest(req, {
    params: updateProjectSchema.shape.params,
    body: updateProjectSchema.shape.body,
  });

  const user = await currentUser(req);
  const { projectId } = req.params;
  const { name, description, startDate, endDate } = req.body;

  // Check if user has access to project
  const project = await prisma.project.findFirst({
    where: {
      id: parseInt(projectId),
      workspace: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
  });

  if (!project) {
    return next(new AppError('Project not found or access denied', 404));
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: parseInt(projectId),
    },
    data: {
      name,
      description,
      startDate,
      endDate,
    },
  });

  res.status(200).json({
    status: 'success',
    data: updatedProject,
  });
});

export const deleteProject = catchAsync(async (req, res, next) => {
  validateRequest(req, {
    params: deleteProjectSchema,
  });

  const user = await currentUser(req);
  const { projectId } = req.params;

  // Check if user has access to delete project
  const project = await prisma.project.findFirst({
    where: {
      id: parseInt(projectId),
      OR: [
        { creatorId: user.id },
        {
          workspace: {
            members: {
              some: {
                userId: user.id,
                role: 'ADMIN',
              },
            },
          },
        },
      ],
    },
  });

  if (!project) {
    return next(new AppError('Project not found or access denied', 404));
  }

  await prisma.$transaction([
    prisma.taskAssignment.deleteMany({
      where: {
        task: {
          projectId: parseInt(projectId),
        },
      },
    }),
    prisma.task.deleteMany({
      where: {
        projectId: parseInt(projectId),
      },
    }),
    prisma.project.delete({
      where: {
        id: parseInt(projectId),
      },
    }),
  ]);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
