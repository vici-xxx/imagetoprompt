import { getServerSession, NextAuthOptions, User } from "next-auth";
import { KyselyAdapter } from "@auth/kysely-adapter";
import GoogleProvider from "next-auth/providers/google";

import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

import { db } from "./db";
import { env } from "./env.mjs";

type UserId = string;
type IsAdmin = boolean;

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      isAdmin: IsAdmin;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    isAdmin: IsAdmin;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  adapter: KyselyAdapter(db),
  // 明确设置 NEXTAUTH_URL
  ...(env.NEXTAUTH_URL && { url: env.NEXTAUTH_URL }),

  providers: [
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        httpOptions: {
          timeout: 30000, // 30秒超时
        }
      })
    ] : []),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // 如果 URL 是相对路径，则基于 baseUrl 构建完整 URL
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // 如果 URL 是同一个域名，则直接返回
      else if (new URL(url).origin === baseUrl) return url;
      // 否则返回 baseUrl
      return baseUrl;
    },
    session({ token, session }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.image = token.picture;
          session.user.isAdmin = token.isAdmin as boolean;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      const email = token?.email ?? "";
      const dbUser = await db
        .selectFrom("User")
        .where("email", "=", email)
        .selectAll()
        .executeTakeFirst();
      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }
      let isAdmin = false;
      if (env.ADMIN_EMAIL) {
        const adminEmails = env.ADMIN_EMAIL.split(",");
        if (email) {
          isAdmin = adminEmails.includes(email);
        }
      }
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        isAdmin: isAdmin,
      };
    },
  },
  debug: env.IS_DEBUG === "true",
};

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
