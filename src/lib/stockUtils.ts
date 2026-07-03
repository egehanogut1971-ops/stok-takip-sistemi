export function getTotalStock(sizes: { currentStock: number }[]): number {
  return sizes.reduce((sum, s) => sum + s.currentStock, 0);
}

export function isListingInStock(
  sizes: { currentStock: number }[],
): boolean {
  return getTotalStock(sizes) > 0;
}
