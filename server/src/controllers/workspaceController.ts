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
