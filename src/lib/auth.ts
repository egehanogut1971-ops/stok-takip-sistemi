import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Kullanıcı Adı", type: "text" },
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined;
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!password) {
          return null;
        }

        const loginId = (email ?? username ?? "").trim().toLowerCase();
        if (!loginId) {
          return null;
        }

        const user = loginId.includes("@")
          ? await prisma.user.findUnique({ where: { email: loginId } })
          : await prisma.user.findUnique({ where: { username: loginId } });

        if (!user) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
});
