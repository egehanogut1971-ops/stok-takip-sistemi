import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const username = String(body.username ?? "")
      .toLowerCase()
      .trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Tüm alanları doldurun." },
        { status: 400 },
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "Şifre en az 4 karakter olmalıdır." },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Şifreler eşleşmiyor." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten alınmış." },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, username, password: hashed },
    });

    await signIn("credentials", { username, password, redirect: false });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu." },
      { status: 500 },
    );
  }
}
