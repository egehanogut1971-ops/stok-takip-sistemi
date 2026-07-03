import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MOVEMENT_TYPES } from "@/lib/constants";
import { applyStockMovement } from "@/lib/stock";

type ImportRow = {
  name: string;
  category: string;
  size: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  minStock: number;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rows: ImportRow[] = Array.isArray(body.rows) ? body.rows : [];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "İçe aktarılacak satır yok." },
        { status: 400 },
      );
    }

    let imported = 0;
    const errors: string[] = [];

    const grouped = new Map<string, ImportRow[]>();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = String(row.name ?? "").trim();
      const categoryName = String(row.category ?? "").trim();
      const size = String(row.size ?? "Tek Beden").trim() || "Tek Beden";

      if (!name || !categoryName) {
        errors.push(`Satır ${i + 1}: ürün adı ve kategori gerekli.`);
        continue;
      }

      const key = `${name.toLowerCase()}::${categoryName.toLowerCase()}`;
      const parsed: ImportRow = {
        name,
        category: categoryName,
        size,
        quantity: Number(row.quantity ?? 0),
        costPrice: Number(row.costPrice ?? 0),
        salePrice: Number(row.salePrice ?? 0),
        minStock: Number(row.minStock ?? 0),
      };

      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(parsed);
    }

    for (const [, groupRows] of grouped) {
      const first = groupRows[0];

      let category = await prisma.category.findUnique({
        where: { name: first.category },
      });

      if (!category) {
        category = await prisma.category.create({
          data: { name: first.category },
        });
      }

      let product = await prisma.product.findFirst({
        where: { name: first.name, categoryId: category.id },
        include: { sizes: true },
      });

      if (!product) {
        product = await prisma.product.create({
          data: {
            name: first.name,
            categoryId: category.id,
            costPrice: first.costPrice,
            salePrice: first.salePrice,
          },
          include: { sizes: true },
        });
      } else {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            costPrice: first.costPrice,
            salePrice: first.salePrice,
          },
        });
      }

      for (const row of groupRows) {
        let productSize = product.sizes.find((s) => s.size === row.size);

        if (!productSize) {
          productSize = await prisma.productSize.create({
            data: {
              productId: product.id,
              size: row.size,
              minStock: row.minStock,
              currentStock: 0,
            },
          });
          product.sizes.push(productSize);
        } else {
          await prisma.productSize.update({
            where: { id: productSize.id },
            data: { minStock: row.minStock },
          });
        }

        if (row.quantity > 0 && productSize.currentStock === 0) {
          await applyStockMovement({
            productSizeId: productSize.id,
            userId: session.user.id,
            type: MOVEMENT_TYPES.BASLANGIC,
            quantity: row.quantity,
            note: "CSV ile içe aktarıldı",
          });
        }

        imported++;
      }
    }

    return NextResponse.json({ imported, errors });
  } catch {
    return NextResponse.json(
      { error: "İçe aktarma başarısız." },
      { status: 500 },
    );
  }
}
