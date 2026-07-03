const TR_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  Ç: "c",
  Ğ: "g",
  İ: "i",
  Ö: "o",
  Ş: "s",
  Ü: "u",
};

export function slugify(text: string): string {
  let slug = text.trim().toLowerCase();
  for (const [from, to] of Object.entries(TR_MAP)) {
    slug = slug.replaceAll(from, to);
  }
  return slug
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function uniqueSlug(base: string, suffix: string): string {
  const slug = slugify(base) || "urun";
  return `${slug}-${suffix.slice(0, 8)}`;
}
