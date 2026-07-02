import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MOVEMENT_TYPES } from "@/lib/constants";
import { applyStockMovement } from "@/lib/stock";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rows = Array.isArray(body.rows) ? body.rows : [];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "İçe aktarılacak satır yok." },
        { status: 400 },
      );
    }

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = String(row.name ?? "").trim();
      const categoryName = String(row.category ?? "").trim();
      const quantity = Number(row.quantity ?? 0);
      const costPrice = Number(row.costPrice ?? 0);
      const salePrice = Number(row.salePrice ?? 0);
      const minStock = Number(row.minStock ?? 0);

      if (!name || !categoryName) {
        errors.push(`Satır ${i + 1}: ürün adı ve kategori gerekli.`);
        continue;
      }

      let category = await prisma.category.findUnique({
        where: { name: categoryName },
      });

      if (!category) {
        category = await prisma.category.create({
          data: { name: categoryName },
        });
      }

      const product = await prisma.product.create({
        data: {
          name,
          categoryId: category.id,
          costPrice,
          salePrice,
          minStock,
          currentStock: 0,
        },
      });

      if (quantity > 0) {
        await applyStockMovement({
          productId: product.id,
          userId: session.user.id,
          type: MOVEMENT_TYPES.BASLANGIC,
          quantity,
          note: "CSV ile içe aktarıldı",
        });
      }

      imported++;
    }

    return NextResponse.json({ imported, errors });
  } catch {
    return NextResponse.json(
      { error: "İçe aktarma başarısız." },
      { status: 500 },
    );
  }
}
