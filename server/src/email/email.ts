import { Resend } from 'resend';
import dotenv from 'dotenv';

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
    console.log(`Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string
) => {
  const verificationUrl = `${clientURL}/verify-email?token=${verificationToken}`;

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
  const resetURL = `${clientURL}/reset-password?token=${resetToken}`;

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
