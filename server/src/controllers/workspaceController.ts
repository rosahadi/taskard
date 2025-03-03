import { PrismaClient, Role, User } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import currentUser from '../utils/currentUser';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  getWorkspaceSchema,
  deleteWorkspaceSchema,
  getAllWorkspacesSchema,
} from '../schemas/workspace';
import { validateRequest } from '../utils/validateRequest';

const prisma = new PrismaClient();

/**
 * Create a new workspace
 * @route POST /api/v1/workspaces
 * @param req - Express request object with workspace details
 * @param res - Express response object
 * @param next - Express next function
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createWorkspace = catchAsync(async (req, res, next) => {
  validateRequest(req, { body: createWorkspaceSchema.shape.body });

  const user = await currentUser(req);
  const { name, image } = req.body;

  const workspace = await prisma.workspace.create({
    data: {
      name,
      image,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: Role.ADMIN,
        },
      },
    },
    include: {
      owner: { select: { name: true, email: true } },
      members: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  res.status(201).json({ status: 'success', data: workspace });
});

/**
 * Create a default workspace for a new user
 * @param user - User object containing user details
 * @returns The created workspace
 */
export const createDefaultWorkspace = async (user: User) => {
  try {
    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name}'s Workspace`,
        ownerId: user.id,
        members: { create: { userId: user.id, role: Role.ADMIN } },
      },
      include: {
        owner: { select: { name: true, email: true } },
        members: { include: { user: { select: { name: true, email: true } } } },
      },
    });
    return workspace;
  } catch {
    throw new Error('Failed to create workspace');
  }
};

/**
 * Get all workspaces the user owns or is a member of
 * @route GET /api/v1/workspaces
 * @param req - Express request object with user authentication
 * @param res - Express response object
 * @param next - Express next function
 */
export const getAllWorkspaces = catchAsync(async (req, res, next) => {
  validateRequest(req, { query: getAllWorkspacesSchema.shape.query });

  const user = await currentUser(req);

  const workspaces = await prisma.workspace.findMany({
    where: {
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!workspaces)
    return next(new AppError('Workspaces not found or access denied', 404));

  res.status(200).json({ status: 'success', data: workspaces });
});

/**
 * Get a single workspace
 * @route GET /api/v1/workspaces/:id
 * @param req - Express request object with workspace ID in params
 * @param res - Express response object
 * @param next - Express next function
 */
export const getWorkspace = catchAsync(async (req, res, next) => {
  validateRequest(req, { params: getWorkspaceSchema.shape.params });

  const user = await currentUser(req);
  const { id } = req.params;

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: parseInt(id),
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    include: {
      owner: { select: { name: true, email: true } },
      members: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  if (!workspace)
    return next(new AppError('Workspace not found or access denied', 404));

  res.status(200).json({ status: 'success', data: workspace });
});

/**
 * Update a workspace
 * @route PATCH /api/v1/workspaces/:id
 * @param req - Express request object with workspace ID and update data
 * @param res - Express response object
 * @param next - Express next function
 */
export const updateWorkspace = catchAsync(async (req, res, next) => {
  validateRequest(req, {
    params: updateWorkspaceSchema.shape.params,
    body: updateWorkspaceSchema.shape.body,
  });

  const user = await currentUser(req);
  const { id } = req.params;
  const { name, image } = req.body;

  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId: parseInt(id), userId: user.id, role: Role.ADMIN },
  });
  const isOwner = await prisma.workspace.findFirst({
    where: { id: parseInt(id), ownerId: user.id },
  });

  if (!membership && !isOwner)
    return next(
      new AppError('You do not have permission to update this workspace', 403)
    );

  const workspace = await prisma.workspace.update({
    where: { id: parseInt(id) },
    data: { name, image },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({ status: 'success', data: workspace });
});

/**
 * Delete a workspace
 * @route DELETE /api/v1/workspaces/:id
 * @param req - Express request object with workspace ID in params
 * @param res - Express response object
 * @param next - Express next function
 */
export const deleteWorkspace = catchAsync(async (req, res, next) => {
  validateRequest(req, { params: deleteWorkspaceSchema.shape.params });

  const user = await currentUser(req);
  const { id } = req.params;

  const workspace = await prisma.workspace.findFirst({
    where: { id: parseInt(id), ownerId: user.id },
  });
  if (!workspace)
    return next(
      new AppError('Workspace not found or you are not the owner', 404)
    );

  await prisma.workspaceMember.deleteMany({
    where: { workspaceId: parseInt(id) },
  });
  await prisma.workspace.delete({ where: { id: parseInt(id) } });

  res.status(204).json({ status: 'success', data: null });
});
