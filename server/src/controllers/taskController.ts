import { PrismaClient, TaskStatus, Priority } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import currentUser from '../utils/currentUser';
import { validateRequest } from '../utils/validateRequest';
import {
  assignTaskSchema,
  createTaskSchema,
  deleteTaskSchema,
  getAllTasksSchema,
  getTaskSchema,
  searchTasksSchema,
  unassignTaskSchema,
  updateTaskSchema,
} from '../schemas/task';
import PrismaFeatures from '../utils/PrismaFeatures';

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

  console.log(req.body);

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
              image: true,
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
              id: true,
              name: true,
              email: true,
              image: true,
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

  // Create the base query
  const features = new PrismaFeatures(prisma.task, req.query).filter().sort();

  // Set initial where condition
  features.query.where = {
    ...features.query.where,
    projectId: Number(projectId),
  };

  // Add include
  features.query.include = {
    assignees: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    },
  };

  const tasks = await features.execute();

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
              image: true,
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

export const searchTasks = catchAsync(async (req, res, next) => {
  validateRequest(req, { query: searchTasksSchema });

  const user = await currentUser(req);
  const { projectId, searchTerm, status, priority } = req.query;

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

  //Search filters
  const whereConditions: {
    projectId: number;
    OR?: Array<
      | { title: { contains: string; mode: 'insensitive' } }
      | { description: { contains: string; mode: 'insensitive' } }
    >;
    status?: TaskStatus;
    priority?: Priority;
  } = {
    projectId: Number(projectId),
  };

  // search in title and description
  if (searchTerm && typeof searchTerm === 'string') {
    whereConditions.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Add status filter
  if (
    status &&
    typeof status === 'string' &&
    status !== 'ALL' &&
    Object.values(TaskStatus).includes(status as TaskStatus)
  ) {
    whereConditions.status = status as TaskStatus;
  }

  // Add priority filter
  if (
    priority &&
    typeof priority === 'string' &&
    priority !== 'ALL' &&
    Object.values(Priority).includes(priority as Priority)
  ) {
    whereConditions.priority = priority as Priority;
  }

  const tasks = await prisma.task.findMany({
    where: whereConditions,
    include: {
      assignees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: tasks,
  });
});

export const updateTask = catchAsync(async (req, res, next) => {
  validateRequest(req, {
    params: updateTaskSchema.shape.params,
    body: updateTaskSchema.shape.body,
  });

  const user = await currentUser(req);
  const taskId: number = parseInt(req.params.taskId, 10);
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    parentTaskId,
    assigneeIds,
  }: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    tags?: string[];
    startDate?: string;
    dueDate?: string;
    points?: number;
    parentTaskId?: number;
    assigneeIds?: number[];
  } = req.body;

  // Check if user has access to the task
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        workspace: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    },
    include: {
      assignees: true,
      project: true,
    },
  });

  if (!task) {
    return next(new AppError('Task not found or access denied', 404));
  }

  // Validate parent task
  if (parentTaskId && parentTaskId !== task.parentTaskId) {
    const parentTask = await prisma.task.findFirst({
      where: {
        id: parentTaskId,
        projectId: task.projectId,
      },
    });

    if (!parentTask) {
      return next(new AppError('Parent task not found in this project', 404));
    }
    if (parentTaskId === taskId) {
      return next(new AppError('Task cannot be its own parent', 400));
    }
  }

  // Update task details
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      description,
      status,
      priority,
      tags,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      points,
      parentTaskId,
    },
    include: {
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

  // Backend logic to validate and update task assignments
  if (assigneeIds) {
    // Validate assigneeIds
    const validUsers = await prisma.user.findMany({
      where: {
        id: { in: assigneeIds },
      },
    });

    if (validUsers.length !== assigneeIds.length) {
      throw new Error('One or more assignee IDs are invalid');
    }

    // Remove existing assignments that are not in the new list
    await prisma.taskAssignment.deleteMany({
      where: {
        taskId: taskId,
        userId: { notIn: assigneeIds },
      },
    });

    // Add new assignees
    const existingAssigneeIds = task.assignees.map((a) => a.userId);
    const newAssignees = assigneeIds.filter(
      (id) => !existingAssigneeIds.includes(id)
    );

    await prisma.taskAssignment.createMany({
      data: newAssignees.map((userId: number) => ({ taskId: taskId, userId })),
      skipDuplicates: true,
    });
  }

  res.status(200).json({
    status: 'success',
    data: updatedTask,
  });
});

export const deleteTask = catchAsync(async (req, res, next) => {
  validateRequest(req, { params: deleteTaskSchema });

  const user = await currentUser(req);
  const { taskId } = req.params;

  const task = await prisma.task.findFirst({
    where: {
      id: parseInt(taskId),
      OR: [
        {
          project: {
            workspace: {
              members: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        },
      ],
    },
  });

  if (!task) {
    return next(new AppError('Task not found or access denied', 404));
  }

  await prisma.$transaction([
    prisma.taskComment.deleteMany({
      where: { taskId: parseInt(taskId) },
    }),
    prisma.taskAttachment.deleteMany({
      where: { taskId: parseInt(taskId) },
    }),
    prisma.taskAssignment.deleteMany({
      where: { taskId: parseInt(taskId) },
    }),
    prisma.task.delete({
      where: { id: parseInt(taskId) },
    }),
  ]);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const assignTask = catchAsync(async (req, res, next) => {
  validateRequest(req, { body: assignTaskSchema });

  const user = await currentUser(req);
  const { taskId, userId } = req.body;

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        workspace: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    },
  });

  if (!task) {
    return next(new AppError('Task not found or access denied', 404));
  }

  const isMember = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspace: {
        projects: {
          some: {
            id: task.projectId,
          },
        },
      },
    },
  });

  if (!isMember) {
    return next(
      new AppError('User must be a member of the workspace to be assigned', 400)
    );
  }

  // Check if assignment already exists
  const existingAssignment = await prisma.taskAssignment.findFirst({
    where: {
      taskId,
      userId,
    },
  });

  if (existingAssignment) {
    return next(new AppError('User is already assigned to this task', 400));
  }

  const assignment = await prisma.taskAssignment.create({
    data: {
      taskId,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  res.status(201).json({
    status: 'success',
    data: assignment,
  });
});

export const unassignTask = catchAsync(async (req, res, next) => {
  validateRequest(req, { body: unassignTaskSchema });

  const user = await currentUser(req);
  const { taskId, userId } = req.body;

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        workspace: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    },
  });

  if (!task) {
    return next(new AppError('Task not found or access denied', 404));
  }

  // Check if assignment exists
  const assignment = await prisma.taskAssignment.findFirst({
    where: {
      taskId,
      userId,
    },
  });

  if (!assignment) {
    return next(new AppError('User is not assigned to this task', 404));
  }

  await prisma.taskAssignment.delete({
    where: {
      id: assignment.id,
    },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
