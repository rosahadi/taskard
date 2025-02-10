import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateAndHashToken = () => {
  const token = generateToken();
  const hashedToken = hashToken(token);
  return { token, hashedToken };
};
