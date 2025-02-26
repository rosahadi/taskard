import { PrismaClient } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import currentUser from '../utils/currentUser';
import { validateRequest } from '../utils/validateRequest';
import {
  addCommentSchema,
  deleteCommentSchema,
  getTaskCommentsSchema,
} from '../schemas/task';

const prisma = new PrismaClient();

export const addComment = catchAsync(async (req, res, next) => {
  validateRequest(req, { body: addCommentSchema });

  const user = await currentUser(req);
  const { taskId, content } = req.body;

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
  });

  if (!task) {
    return next(new AppError('Task not found or access denied', 404));
  }

  const comment = await prisma.taskComment.create({
    data: {
      taskId,
      userId: user.id,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.status(201).json({
    status: 'success',
    data: comment,
  });
});

export const deleteComment = catchAsync(async (req, res, next) => {
  validateRequest(req, { params: deleteCommentSchema });

  const user = await currentUser(req);
  const { commentId } = req.params;

  // Check if comment exists and user has permission to delete it
  const comment = await prisma.taskComment.findFirst({
    where: {
      id: parseInt(commentId),
      OR: [
        { userId: user.id }, // User is the comment author
        {
          task: {
            creatorId: user.id, // User is the task creator
          },
        },
        {
          task: {
            project: {
              creatorId: user.id, // User is the project creator
            },
          },
        },
        {
          task: {
            project: {
              workspace: {
                members: {
                  some: {
                    userId: user.id,
                    role: 'ADMIN', // User is a workspace admin
                  },
                },
              },
            },
          },
        },
      ],
    },
  });

  if (!comment) {
    return next(new AppError('Comment not found or access denied', 404));
  }

  await prisma.taskComment.delete({
    where: {
      id: parseInt(commentId),
    },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getTaskComments = catchAsync(async (req, res, next) => {
  validateRequest(req, { params: getTaskCommentsSchema });

  const user = await currentUser(req);
  const { taskId } = req.params;

  const task = await prisma.task.findFirst({
    where: {
      id: parseInt(taskId),
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

  const comments = await prisma.taskComment.findMany({
    where: {
      taskId: parseInt(taskId),
    },
    orderBy: {
      createdAt: 'desc',
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

  const total = await prisma.taskComment.count({
    where: {
      taskId: parseInt(taskId),
    },
  });

  res.status(200).json({
    status: 'success',
    results: comments.length,
    total,
    data: comments,
  });
});
