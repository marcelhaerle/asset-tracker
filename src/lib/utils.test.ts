import { suggestAssetTag } from './utils';
import { prisma } from './prisma';

// Mock the Prisma client
jest.mock('./prisma', () => ({
  prisma: {
    category: {
      findUnique: jest.fn(),
    },
    asset: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('suggestAssetTag', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('returns empty string when category not found', async () => {
    // Mock the category.findUnique to return null (category not found)
    (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await suggestAssetTag('non-existent-category-id');

    expect(prisma.category.findUnique).toHaveBeenCalledWith({
      where: { id: 'non-existent-category-id' },
    });
    expect(result).toBe('');
  });

  test('returns first number when no assets found for category', async () => {
    // Mock the category.findUnique to return a valid category
    (prisma.category.findUnique as jest.Mock).mockResolvedValue({
      id: 'category-id',
      assetTagPrefix: 'LAP',
    });

    // Mock the asset.findMany to return empty array (no assets found)
    (prisma.asset.findMany as jest.Mock).mockResolvedValue([]);

    const result = await suggestAssetTag('category-id');

    expect(prisma.category.findUnique).toHaveBeenCalledWith({
      where: { id: 'category-id' },
    });
    expect(prisma.asset.findMany).toHaveBeenCalledWith({
      where: { categoryId: 'category-id' },
      orderBy: { assetTag: 'desc' },
      take: 1,
    });
    expect(result).toBe('LAP-0001');
  });

  test('returns empty string when asset tag does not contain hyphen', async () => {
    (prisma.category.findUnique as jest.Mock).mockResolvedValue({
      id: 'category-id',
      assetTagPrefix: 'LAP',
    });

    (prisma.asset.findMany as jest.Mock).mockResolvedValue([
      { assetTag: 'LAP123' }, // No hyphen
    ]);

    const result = await suggestAssetTag('category-id');

    expect(result).toBe('');
  });

  test('returns empty string when number part is not a valid number', async () => {
    (prisma.category.findUnique as jest.Mock).mockResolvedValue({
      id: 'category-id',
      assetTagPrefix: 'LAP',
    });

    (prisma.asset.findMany as jest.Mock).mockResolvedValue([
      { assetTag: 'LAP-ABC' }, // Not a number after hyphen
    ]);

    const result = await suggestAssetTag('category-id');

    expect(result).toBe('');
  });

  test('increments the number part for valid asset tag', async () => {
    (prisma.category.findUnique as jest.Mock).mockResolvedValue({
      id: 'category-id',
      assetTagPrefix: 'LAP',
    });

    (prisma.asset.findMany as jest.Mock).mockResolvedValue([{ assetTag: 'LAP-0123' }]);
    (prisma.asset.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await suggestAssetTag('category-id');

    expect(result).toBe('LAP-0124');
  });

  test('handles complex prefixes with multiple hyphens', async () => {
    (prisma.category.findUnique as jest.Mock).mockResolvedValue({
      id: 'category-id',
      assetTagPrefix: 'LAP-2023',
    });

    (prisma.asset.findMany as jest.Mock).mockResolvedValue([{ assetTag: 'LAP-2023-0042' }]);

    const result = await suggestAssetTag('category-id');

    expect(result).toBe('LAP-2023-0043');
  });
});
test('returns empty string when category has empty assetTagPrefix', async () => {
  // Mock the category.findUnique to return a category with empty prefix
  (prisma.category.findUnique as jest.Mock).mockResolvedValue({
    id: 'category-id',
    assetTagPrefix: '',
  });

  const result = await suggestAssetTag('category-id');

  expect(prisma.category.findUnique).toHaveBeenCalledWith({
    where: { id: 'category-id' },
  });
  expect(result).toBe('');
});

test('returns empty string when category has null assetTagPrefix', async () => {
  // Mock the category.findUnique to return a category with null prefix
  (prisma.category.findUnique as jest.Mock).mockResolvedValue({
    id: 'category-id',
    assetTagPrefix: null,
  });

  const result = await suggestAssetTag('category-id');

  expect(prisma.category.findUnique).toHaveBeenCalledWith({
    where: { id: 'category-id' },
  });
  expect(result).toBe('');
});

test('maintains padding for large number increments', async () => {
  (prisma.category.findUnique as jest.Mock).mockResolvedValue({
    id: 'category-id',
    assetTagPrefix: 'DEV',
  });

  (prisma.asset.findMany as jest.Mock).mockResolvedValue([{ assetTag: 'DEV-0999' }]);
  (prisma.asset.findUnique as jest.Mock).mockResolvedValue(null);

  const result = await suggestAssetTag('category-id');

  expect(result).toBe('DEV-1000');
});
