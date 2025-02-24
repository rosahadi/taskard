import { PrismaClient, Role } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import currentUser from '../utils/currentUser';
import { validateRequest } from '../utils/validateRequest';
import {
  getWorkspaceMembersSchema,
  removeMemberSchema,
  updateMemberRoleSchema,
} from '../schemas/workspace';

const prisma = new PrismaClient();

// Get all members of a workspace
export const getWorkspaceMembers = catchAsync(async (req, res, next) => {
  validateRequest(req, { params: getWorkspaceMembersSchema });

  const user = await currentUser(req);
  const { workspaceId } = req.params;

  // Check if user has access to workspace
  const hasAccess = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: parseInt(workspaceId),
      userId: user.id,
    },
  });
  const isOwner = await prisma.workspace.findFirst({
    where: {
      id: parseInt(workspaceId),
      ownerId: user.id,
    },
  });

  if (!hasAccess && !isOwner) {
    return next(new AppError('Access denied to this workspace', 403));
  }

  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId: parseInt(workspaceId),
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

  res.status(200).json({
    status: 'success',
    data: members,
  });
});

// Update member role
export const updateMemberRole = catchAsync(async (req, res, next) => {
  validateRequest(req, {
    params: updateMemberRoleSchema.shape.params,
    body: updateMemberRoleSchema.shape.body,
  });

  const user = await currentUser(req);
  const { memberId } = req.params;
  const { role } = req.body;

  console.log(memberId);

  if (!Object.values(Role).includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }

  const member = await prisma.workspaceMember.findUnique({
    where: { id: parseInt(memberId) },
    include: { workspace: true },
  });

  if (!member) {
    return next(new AppError('Member not found', 404));
  }

  // Check if user is workspace owner or admin
  const hasPermission = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: member.workspaceId,
      userId: user.id,
      role: Role.ADMIN,
    },
  });

  const isOwner = member.workspace.ownerId === user.id;

  if (!hasPermission && !isOwner) {
    return next(
      new AppError('You do not have permission to update member roles', 403)
    );
  }

  const updatedMember = await prisma.workspaceMember.update({
    where: { id: parseInt(memberId) },
    data: { role },
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

  res.status(200).json({
    status: 'success',
    data: updatedMember,
  });
});

// Remove member from workspace
export const removeMember = catchAsync(async (req, res, next) => {
  validateRequest(req, { params: removeMemberSchema });

  const user = await currentUser(req);
  const { memberId } = req.params;

  const member = await prisma.workspaceMember.findUnique({
    where: { id: parseInt(memberId) },
    include: { workspace: true },
  });

  if (!member) {
    return next(new AppError('Member not found', 404));
  }

  // Check if user is workspace owner or admin
  const hasPermission = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: member.workspaceId,
      userId: user.id,
      role: Role.ADMIN,
    },
  });

  const isOwner = member.workspace.ownerId === user.id;

  if (!hasPermission && !isOwner) {
    return next(
      new AppError('You do not have permission to remove members', 403)
    );
  }

  // Cannot remove workspace owner
  if (member.workspace.ownerId === member.userId) {
    return next(new AppError('Cannot remove workspace owner', 403));
  }

  await prisma.workspaceMember.delete({
    where: { id: parseInt(memberId) },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
