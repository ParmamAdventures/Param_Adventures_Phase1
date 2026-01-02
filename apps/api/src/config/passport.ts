
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma";
import { env } from "./env";
import { logger } from "../lib/logger";

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback", // Proxied via Nginx or direct
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // 1. Check if user exists by Google ID
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id } as any,
          });

          if (user) {
            return done(null, user);
          }

          // 2. Check if user exists by Email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await prisma.user.findUnique({
              where: { email },
            });

            if (user) {
              // Link Google Account
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  googleId: profile.id,
                  avatarUrl: profile.photos?.[0]?.value || (user as any).avatarUrl,
                } as any,
              });
              return done(null, user);
            }
          }

          // 3. Create New User
          user = await prisma.user.create({
            data: {
              email: email!,
              name: profile.displayName,
              googleId: profile.id,
              avatarUrl: profile.photos?.[0]?.value,
              password: "", 
              status: "ACTIVE",
            } as any,
          });

          return done(null, user);
        } catch (error) {
          logger.error("Google Auth Strategy Error", error);
          return done(error as Error, undefined);
        }
      },
    ),
  );
} else {
  logger.warn("Google OAuth credentials missing. Social login disabled.");
}

export default passport;
