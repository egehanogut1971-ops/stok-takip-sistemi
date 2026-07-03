import type { NextAuthConfig } from "next-auth";
import { isStaff, ROLES } from "@/lib/roles";

function isShopRoute(pathname: string) {
  return pathname.startsWith("/magaza");
}

function isAuthPage(pathname: string) {
  return pathname.startsWith("/login") || pathname.startsWith("/kayit");
}

function isPublicApi(pathname: string) {
  return (
    pathname.startsWith("/api/auth") || pathname.startsWith("/api/shop")
  );
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role ?? ROLES.STAFF;

      if (isPublicApi(pathname)) return true;

      if (isShopRoute(pathname)) return true;

      if (isAuthPage(pathname)) {
        if (isLoggedIn && isStaff(role)) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        if (pathname === "/") {
          return Response.redirect(new URL("/magaza", nextUrl));
        }
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (!isStaff(role)) {
        return Response.redirect(new URL("/magaza", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = (token.role as string) ?? ROLES.STAFF;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
