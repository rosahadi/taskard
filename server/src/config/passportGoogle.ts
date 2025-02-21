import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${process.env.CLIENT_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: profile.emails?.[0]?.value },
              {
                AND: [{ provider: 'google' }, { providerId: profile.id }],
              },
            ],
          },
        });

        const image = profile.photos?.[0]?.value || null;

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0]?.value || '',
              name: profile.displayName,
              password: '',
              emailVerified: true,
              provider: 'google',
              providerId: profile.id,
              image: image,
            },
          });
        } else if (!user.provider) {
          // Update existing email user with Google info
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              provider: 'google',
              providerId: profile.id,
              emailVerified: true,
              image: image,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    }
  )
);

export default passport;
