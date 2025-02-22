import { Resend } from 'resend';
import dotenv from 'dotenv';
import { Role } from '@prisma/client';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';

const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    await resend.emails.send({
      from: 'Taskard <no-reply@rosah.dev>',
      to,
      subject,
      html,
    });
  } catch {
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string
) => {
  const verificationUrl = `${clientURL}/auth/verify-email?token=${verificationToken}`;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Email Verification</h2>
      <p>Hello ${name},</p>
      <p>Click the button below to verify your email:</p>
      <a href="${verificationUrl}" style="background-color:rgb(76, 120, 175); color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Verify Email
      </a>
      <p>Best, <br>Taskard Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email',
    html: emailContent,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
) => {
  const resetURL = `${clientURL}/auth/reset-password?token=${resetToken}`;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Email passwordReset</h2>
      <p>Hello ${name},</p>
      <p>Click the button below to verify your email:</p>
      <a href="${resetURL}" style="background-color:rgb(76, 120, 175); color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Verify Email
      </a>
      <p>Best, <br>Taskard Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: emailContent,
  });
};

export const sendWorkspaceInviteEmail = async (
  email: string,
  inviterName: string,
  workspaceName: string,
  inviteToken: string,
  workspaceId: number,
  role: Role
) => {
  const inviteUrl = `${clientURL}/workspaces/${workspaceId}/join?token=${inviteToken}`;

  const roleDisplay = role === Role.ADMIN ? 'Admin' : 'Member';

  const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <h2>Workspace Invitation</h2>
      <p>Hello,</p>
      <p><strong>${inviterName}</strong> has invited you to join the workspace <strong>${workspaceName}</strong> as a ${roleDisplay}.</p>
      
      <div style="margin: 25px 0;">
        <a href="${inviteUrl}" style="background-color: rgb(76, 120, 175); color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Accept Invitation
        </a>
      </div>
      
      <p>This invitation will expire in 7 days.</p>
      <p>If you don't have an account yet, you'll need to create one to join the workspace.</p>
      <p>Best,<br>Taskard Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Invitation to join ${workspaceName}`,
    html: emailContent,
  });
};
