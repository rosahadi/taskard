import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const VERIFICATION_TOKEN_EXPIRES_IN = 1 * 60 * 60 * 1000;

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const createVerificationToken = async (userId: number) => {
  const verificationToken = generateVerificationToken();
  const verificationExpires = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRES_IN
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationToken,
      verificationExpires,
    },
  });

  return verificationToken;
};
