import type { NextAuthConfig } from "next-auth";
import { isStaff, ROLES } from "@/lib/roles";

function isShopRoute(pathname: string) {
  return pathname.startsWith("/magaza");
}

function isShopAdminRoute(pathname: string) {
  return pathname.startsWith("/magaza/yonetim");
}

function isShopAuthRoute(pathname: string) {
  return (
    pathname.startsWith("/magaza/giris") ||
    pathname.startsWith("/magaza/kayit")
  );
}

function isPanelRoute(pathname: string) {
  return pathname.startsWith("/panel");
}

function isPanelLoginRoute(pathname: string) {
  return pathname.startsWith("/panel/giris");
}

function isLegacyStaffLogin(pathname: string) {
  return pathname.startsWith("/login");
}

function isLegacyKayitPage(pathname: string) {
  return pathname.startsWith("/kayit");
}

function isPublicApi(pathname: string) {
  if (pathname.startsWith("/api/shop/listings")) return false;
  if (pathname.startsWith("/api/shop/upload")) return false;
  return (
    pathname.startsWith("/api/auth") || pathname.startsWith("/api/shop")
  );
}

export const authConfig = {
  pages: {
    signIn: "/magaza/giris",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role ?? ROLES.CUSTOMER;

      if (isPublicApi(pathname)) return true;

      if (isLegacyStaffLogin(pathname)) {
        return Response.redirect(new URL("/panel/giris", nextUrl));
      }

      if (isLegacyKayitPage(pathname)) {
        return Response.redirect(new URL("/magaza/kayit", nextUrl));
      }

      if (isShopAdminRoute(pathname)) {
        if (!isLoggedIn || !isStaff(role)) {
          return Response.redirect(new URL("/magaza", nextUrl));
        }
        return true;
      }

      if (isShopAuthRoute(pathname)) return true;

      if (isShopRoute(pathname)) return true;

      if (isPanelLoginRoute(pathname)) {
        if (isLoggedIn && isStaff(role)) {
          return Response.redirect(new URL("/panel", nextUrl));
        }
        return true;
      }

      if (isPanelRoute(pathname)) {
        if (!isLoggedIn || !isStaff(role)) {
          if (!isLoggedIn) {
            return Response.redirect(new URL("/panel/giris", nextUrl));
          }
          return Response.redirect(new URL("/magaza", nextUrl));
        }
        return true;
      }

      if (pathname === "/") {
        return Response.redirect(new URL("/magaza", nextUrl));
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/magaza", nextUrl));
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
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        if (token.email) {
          session.user.email = token.email as string;
        }
        session.user.role = (token.role as string) ?? ROLES.CUSTOMER;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
