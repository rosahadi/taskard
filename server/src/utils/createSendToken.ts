import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const signToken = (id: string) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const expiresIn: jwt.SignOptions['expiresIn'] =
    jwtExpiresIn as jwt.SignOptions['expiresIn'];

  return jwt.sign({ id }, jwtSecret, {
    expiresIn,
  });
};

export const createSendToken = (
  user: User,
  statusCode: number,
  res: Response
) => {
  const token = signToken(user.id.toString());

  const cookieExpiresInDays = parseInt(
    process.env.JWT_COOKIE_EXPIRES_IN || '7',
    10
  );

  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    secure: isProduction,
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: { id: user.id, email: user.email, name: user.name },
    },
  });
};
