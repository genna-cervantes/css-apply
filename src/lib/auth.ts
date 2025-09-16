import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

interface UserSession {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  dbId?: string;
  studentNumber?: string | null;
  section?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  hasCompletedProfile?: boolean;
  applicationStatus?: {
    member: {hasApplication: boolean; hasPayment?: boolean; isAccepted?: boolean; appliedAt?: Date};
    ea: {hasApplication: boolean; status?: string; isAccepted?: boolean};
    committee: {hasApplication: boolean; status?: string; isAccepted?: boolean};
  };
  hasMemberApplication?: boolean;
  hasEAApplication?: boolean;
  hasCommitteeApplication?: boolean;
  ebProfile?: {position: string; committees: string[]; isActive: boolean} | null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Check if user exists in database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          return true;
        }

        // If new user, create a basic user record
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name || "",
            role: "user", // Default role
          },
        });

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = "user";
      }

      if (token?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: {
              id: true,
              role: true,
              name: true,
            },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.dbId = dbUser.id;
            token.name = dbUser.name;
          } else {
            // User not found in database
          }
        } catch (error) {
          console.error("JWT callback database error:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session?.user && token) {
        (session.user as UserSession).role = token.role as string;
        (session.user as UserSession).dbId = token.dbId as string;

        const shouldFetchFullData =
          session.user.role === "admin" ||
          session.user.role === "super_admin" ||
          token.fetchFullData === true;

        if (shouldFetchFullData) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email! },
              select: {
                id: true,
                studentNumber: true,
                section: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                memberApplication: {
                  select: {
                    id: true,
                    hasAccepted: true,
                    paymentProof: true,
                    createdAt: true,
                  },
                },
                eaApplication: {
                  select: {
                    id: true,
                    hasAccepted: true,
                    status: true,
                  },
                },
                committeeApplication: {
                  select: {
                    id: true,
                    hasAccepted: true,
                    status: true,
                  },
                },
                ebProfile: {
                  select: {
                    position: true,
                    committees: true,
                    isActive: true,
                  },
                },
              },
            });

            if (dbUser) {
              // Add database user details to session
              (session.user as UserSession).dbId = dbUser.id;
              (session.user as UserSession).studentNumber =
                dbUser.studentNumber;
              (session.user as UserSession).section = dbUser.section;
              (session.user as UserSession).name = dbUser.name;
              (session.user as UserSession).role = dbUser.role;
              (session.user as UserSession).createdAt = dbUser.createdAt;
              (session.user as UserSession).updatedAt = dbUser.updatedAt;
              (session.user as UserSession).ebProfile = dbUser.ebProfile;

              // Add application status information
              (session.user as UserSession).hasMemberApplication =
                !!dbUser.memberApplication;
              (session.user as UserSession).hasEAApplication =
                !!dbUser.eaApplication;
              (session.user as UserSession).hasCommitteeApplication =
                !!dbUser.committeeApplication;

              // Check if user has completed their profile
              (session.user as UserSession).hasCompletedProfile =
                !!dbUser.studentNumber && !!dbUser.section;

              // Check application status for routing
              (session.user as UserSession).applicationStatus = {
                member: dbUser.memberApplication
                  ? {
                      hasApplication: true,
                      hasPayment: !!dbUser.memberApplication.paymentProof,
                      isAccepted: dbUser.memberApplication.hasAccepted,
                      appliedAt: dbUser.memberApplication.createdAt,
                    }
                  : { hasApplication: false },

                ea: dbUser.eaApplication
                  ? {
                      hasApplication: true,
                      status: dbUser.eaApplication.status ?? undefined,
                      isAccepted: dbUser.eaApplication.hasAccepted,
                    }
                  : { hasApplication: false },

                committee: dbUser.committeeApplication
                  ? {
                      hasApplication: true,
                      status: dbUser.committeeApplication.status ?? undefined,
                      isAccepted: dbUser.committeeApplication.hasAccepted,
                    }
                  : { hasApplication: false },
              };
            }
          } catch (error) {
            console.error("Session callback database error:", error);
          }
        }
      }

      return session;
    },

    async redirect({ url }) {
      if (url.startsWith("/api/auth")) {
        return url;
      }

      if (url.startsWith("/")) {
        return url;
      }

      return url;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
    signOut: "/",
  },
  // Add session strategy for better performance
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: false,
};
