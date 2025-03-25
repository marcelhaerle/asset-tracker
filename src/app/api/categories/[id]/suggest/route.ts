'use server';

import { suggestAssetTag } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const categoryId = (await params).id;
  const suggestedAssetTag = await suggestAssetTag(categoryId);
  return NextResponse.json({ suggestedAssetTag }, { status: 200 });
}
