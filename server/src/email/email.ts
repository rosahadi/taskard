import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string
) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: 'Taskard <no-reply@rosah.dev>',
      to: email,
      subject: 'Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Email Verification</h2>
          <p>Hello ${name},</p>
          <p>Click the button below to verify your email:</p>
          <a href="${verificationUrl}" style="background-color:rgb(76, 120, 175); color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify Email
          </a>
          <p>Best, <br>Taskard Team</p>
        </div>
      `,
    });

    console.log('Verification email sent to', email);
  } catch (error) {
    console.error('Error sending email with Resend:', error);
    throw new Error('Failed to send verification email');
  }
};
