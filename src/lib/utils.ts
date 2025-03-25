import { prisma } from './prisma';

export async function suggestAssetTag(categoryId: string): Promise<string> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || !category.assetTagPrefix || category.assetTagPrefix === '') {
    return '';
  }

  const lastAsset = await prisma.asset.findMany({
    where: {
      categoryId,
    },
    orderBy: {
      assetTag: 'desc',
    },
    take: 1,
  });

  if (lastAsset.length === 0) {
    return `${category.assetTagPrefix}-0001`;
  }

  const lastAssetTag = lastAsset[0].assetTag;

  if (!lastAssetTag.includes('-')) {
    return '';
  }

  // Expected format: {prefix}-{number}
  const numberPart = lastAssetTag.slice(lastAssetTag.lastIndexOf('-') + 1);

  // Check if numberPart is a valid number
  if (isNaN(Number(numberPart))) {
    return '';
  }

  const lastNumber = parseInt(numberPart, 10);
  const nextNumber = lastNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(4, '0');
  const nextAssetTag = `${category.assetTagPrefix}-${paddedNumber}`;

  // Ensure the generated tag is actually unique
  const existingAsset = await prisma.asset.findUnique({
    where: { assetTag: nextAssetTag },
  });

  if (existingAsset) {
    console.error(`Asset tag ${nextAssetTag} already exists`);
    return '';
  }

  return nextAssetTag;
}
