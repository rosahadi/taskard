import { Strategy as JwtStrategy } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Extract JWT from either cookies or Authorization header
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractToken = (req: any) => {
  let token = null;
  if (req.cookies?.jwt) {
    token = req.cookies.jwt; // Extract token from cookies
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header
  }
  return token;
};

const options = {
  jwtFromRequest: extractToken,
  secretOrKey: process.env.JWT_SECRET as string,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const userId = parseInt(jwt_payload.id, 10);

      if (isNaN(userId)) {
        return done(new Error('Invalid user ID'), false);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return done(null, false);
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
