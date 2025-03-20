import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssetStatus } from '@prisma/client';

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        category: true,
        location: true,
        assignedTo: true,
      },
    });
    
    return NextResponse.json({ assets }, { status: 200 });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.assetTag || !body.categoryId) {
      return NextResponse.json(
        { error: 'Name, asset tag, and category are required' },
        { status: 400 }
      );
    }

    // Check if asset tag already exists
    const existingAsset = await prisma.asset.findUnique({
      where: { assetTag: body.assetTag }
    });

    if (existingAsset) {
      return NextResponse.json(
        { error: 'An asset with this tag already exists' },
        { status: 400 }
      );
    }

    // Create the asset
    const newAsset = await prisma.asset.create({
      data: {
        name: body.name,
        assetTag: body.assetTag,
        serialNumber: body.serialNumber || null,
        description: body.description || null,
        model: body.model || null,
        manufacturer: body.manufacturer || null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
        expectedLifespan: body.expectedLifespan ? parseInt(body.expectedLifespan) : null,
        status: (body.status as AssetStatus) || 'AVAILABLE',
        notes: body.notes || null,
        categoryId: body.categoryId,
        locationId: body.locationId || null,
        assignedToId: body.assignedToId || null,
      },
      include: {
        category: true,
        location: true,
        assignedTo: true,
      }
    });

    return NextResponse.json(
      { 
        message: 'Asset created successfully', 
        asset: newAsset 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}