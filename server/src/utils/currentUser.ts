import { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';

const prisma = new PrismaClient();

// Type guard for JWT payload
interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

function isJwtPayload(decoded: unknown): decoded is JwtPayload {
  return (
    typeof decoded === 'object' &&
    decoded !== null &&
    'id' in decoded &&
    'iat' in decoded &&
    'exp' in decoded &&
    typeof (decoded as Record<string, unknown>).id === 'string' &&
    typeof (decoded as Record<string, unknown>).iat === 'number' &&
    typeof (decoded as Record<string, unknown>).exp === 'number'
  );
}

const currentUser = async (req: Request) => {
  //  Get token
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || token.trim() === '') {
    throw new AppError(
      'You are not logged in! Please log in to get access.',
      401
    );
  }

  let decoded: unknown;

  try {
    // Verify token
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    throw new AppError('Invalid or expired token. Please log in again.', 401);
  }

  if (!isJwtPayload(decoded)) {
    throw new AppError('Invalid token payload', 401);
  }

  //  Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: parseInt(decoded.id, 10) },
  });

  if (!user) {
    throw new AppError(
      'The user belonging to this token no longer exists.',
      401
    );
  }

  // Check if password was changed after token was issued
  if (user.passwordChangedAt && decoded.iat) {
    const changedTimestamp = user.passwordChangedAt.getTime() / 1000;
    if (decoded.iat < changedTimestamp) {
      throw new AppError(
        'User recently changed password! Please log in again.',
        401
      );
    }
  }

  return user;
};

export default currentUser;
