import { PrismaClient, Role } from '@prisma/client';
import crypto from 'crypto';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import currentUser from '../utils/currentUser';
import { inviteWorkspaceMemberSchema } from '../schemas';
import { sendWorkspaceInviteEmail } from '../email/email';
import { generateAndHashToken } from '../utils/auth';

const prisma = new PrismaClient();

// Invite member to workspace
export const inviteWorkspaceMember = catchAsync(async (req, res, next) => {
  const user = await currentUser(req);
  const { id } = req.params;
  const workspaceId = parseInt(id);

  const parsedData = inviteWorkspaceMemberSchema.safeParse(req.body);
  if (!parsedData.success) {
    const errorMessages = parsedData.error.errors.map((err) => err.message);
    return next(new AppError(errorMessages.join(', '), 400));
  }

  const { email, role } = parsedData.data;

  // Check if user is owner or admin
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: user.id,
      role: Role.ADMIN,
    },
  });
  const isOwner = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      ownerId: user.id,
    },
  });

  if (!membership && !isOwner) {
    return next(
      new AppError(
        'You do not have permission to invite members to this workspace',
        403
      )
    );
  }

  // Check if user is already a member
  const existingMember = await prisma.user.findFirst({
    where: {
      email,
      OR: [
        { ownedWorkspaces: { some: { id: workspaceId } } },
        { workspaceMemberships: { some: { workspaceId } } },
      ],
    },
  });

  if (existingMember) {
    return next(
      new AppError('User is already a member of this workspace', 400)
    );
  }

  // Check if invite already exists
  const existingInvite = await prisma.workspaceInvite.findUnique({
    where: {
      email_workspaceId: {
        email,
        workspaceId,
      },
    },
  });

  if (existingInvite) {
    return next(new AppError('Invitation already sent to this email', 400));
  }

  // Get workspace details
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { name: true },
  });

  if (!workspace) {
    return next(new AppError('Workspace not found', 404));
  }

  // Generate invite token
  const { token, hashedToken } = generateAndHashToken();
  const tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Create invite record
  const invite = await prisma.workspaceInvite.create({
    data: {
      email,
      role,
      token: hashedToken,
      expires: tokenExpires,
      workspaceId,
      invitedBy: user.id,
    },
  });

  // Send invitation email
  await sendWorkspaceInviteEmail(
    email,
    user.name,
    workspace.name,
    token,
    workspaceId,
    role
  );

  res.status(201).json({
    status: 'success',
    message: `Invitation sent to ${email}`,
    data: {
      id: invite.id,
      email: invite.email,
      role: invite.role,
    },
  });
});

// Accept workspace invitation
export const acceptWorkspaceInvitation = catchAsync(async (req, res, next) => {
  const user = await currentUser(req);
  const { token, id } = req.params;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Find invitation
  const invite = await prisma.workspaceInvite.findFirst({
    where: {
      token: tokenHash,
      workspaceId: parseInt(id),
      email: user.email,
      expires: { gt: new Date() },
    },
  });

  if (!invite) {
    return next(new AppError('Invalid or expired invitation', 400));
  }

  const existingMember = await prisma.workspaceMember.findFirst({
    where: {
      userId: user.id,
      workspaceId: parseInt(id),
    },
  });

  if (existingMember) {
    return next(
      new AppError('You are already a member of this workspace', 400)
    );
  }

  // Add user to workspace
  await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: parseInt(id),
      role: invite.role,
    },
  });

  // Delete invitation
  await prisma.workspaceInvite.delete({
    where: { id: invite.id },
  });

  res.status(200).json({
    status: 'success',
    message: 'You have successfully joined the workspace',
  });
});

// Scheduled task to clean up expired invitatinos
export const cleanupExpiredInvitations = async () => {
  try {
    const deletedInvites = await prisma.workspaceInvite.deleteMany({
      where: {
        expires: { lt: new Date() },
      },
    });

    console.log(`Deleted ${deletedInvites.count} expired invitations.`);
  } catch (error) {
    console.error('Error cleaning up expired invitations:', error);
  }
};
