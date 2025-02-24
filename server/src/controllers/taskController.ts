import { Priority, PrismaClient, TaskStatus } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import currentUser from '../utils/currentUser';
import { validateRequest } from '../utils/validateRequest';
import {
  createTaskSchema,
  getAllTasksSchema,
  getTaskSchema,
} from '../schemas/task';

const prisma = new PrismaClient();

export const createTask = catchAsync(async (req, res, next) => {
  validateRequest(req, { body: createTaskSchema });

  const user = await currentUser(req);
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    parentTaskId,
    assigneeIds,
  } = req.body;

  // Check if user has access to the project
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
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

  // Check if parent task exists in the same project if provided
  if (parentTaskId) {
    const parentTask = await prisma.task.findFirst({
      where: {
        id: parentTaskId,
        projectId,
      },
    });

    if (!parentTask) {
      return next(new AppError('Parent task not found in this project', 404));
    }
  }

  // Create the task
  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || TaskStatus.TODO,
      priority: priority || Priority.NORMAL,
      tags: tags || [],
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      points,
      projectId,
      parentTaskId,
      creatorId: user.id,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Assign task to users if assigneeIds provided
  if (assigneeIds && assigneeIds.length > 0) {
    const assignmentPromises = assigneeIds.map(async (userId: number) => {
      // Check if user is member of the workspace
      const isMember = await prisma.workspaceMember.findFirst({
        where: {
          userId,
          workspace: {
            projects: {
              some: {
                id: projectId,
              },
            },
          },
        },
      });

      if (!isMember) {
        return null;
      }

      return prisma.taskAssignment.create({
        data: {
          userId,
          taskId: task.id,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    });

    await Promise.all(assignmentPromises);
  }

  // Get the task with assignments
  const taskWithAssignments = await prisma.task.findUnique({
    where: {
      id: task.id,
    },
    include: {
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
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
  });

  res.status(201).json({
    status: 'success',
    data: taskWithAssignments,
  });
});

export const getAllTasks = catchAsync(async (req, res, next) => {
  validateRequest(req, { query: getAllTasksSchema });

  const user = await currentUser(req);
  const { projectId } = req.query;

  // See if user has access to project
  const project = await prisma.project.findFirst({
    where: {
      id: Number(projectId),
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

  // Fetch all tasks for the project
  const tasks = await prisma.task.findMany({
    where: {
      projectId: Number(projectId),
    },
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
  });

  res.status(200).json({
    status: 'success',
    data: tasks,
  });
});

export const getTask = catchAsync(async (req, res, next) => {
  validateRequest(req, { params: getTaskSchema });

  const user = await currentUser(req);
  const { taskId } = req.params;

  // Fetch the task
  const task = await prisma.task.findUnique({
    where: {
      id: Number(taskId),
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      project: {
        select: {
          workspace: {
            select: {
              members: {
                where: {
                  userId: user.id,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  // Check if user has access to the task's project
  if (
    !task.project.workspace.members.some((member) => member.userId === user.id)
  ) {
    return next(new AppError('Access denied', 403));
  }

  res.status(200).json({
    status: 'success',
    data: task,
  });
});
