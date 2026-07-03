import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/roles";

function emailToUsername(email: string) {
  const base = email.split("@")[0]?.replace(/[^a-z0-9]/gi, "") || "user";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`.toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Tüm alanları doldurun." },
        { status: 400 },
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi girin." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır." },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Şifreler eşleşmiyor." },
        { status: 400 },
      );
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı." },
        { status: 400 },
      );
    }

    let username = emailToUsername(email);
    for (let i = 0; i < 5; i++) {
      const taken = await prisma.user.findUnique({ where: { username } });
      if (!taken) break;
      username = emailToUsername(email);
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashed,
        role: ROLES.CUSTOMER,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu." },
      { status: 500 },
    );
  }
}
