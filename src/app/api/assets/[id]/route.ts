import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssetStatus } from '@prisma/client';

// GET a specific asset by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        category: true,
        location: true,
        assignedTo: true,
        maintenanceRecords: {
          orderBy: {
            date: 'desc'
          }
        },
        checkoutHistory: {
          include: {
            employee: true
          },
          orderBy: {
            checkedOutAt: 'desc'
          }
        },
        serviceSchedule: {
          include: {
            serviceRecords: {
              orderBy: {
                serviceDate: 'desc'
              }
            }
          }
        }
      }
    });
    
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ asset }, { status: 200 });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

// PUT to update an asset
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    const body = await request.json();
    
    // Check if asset exists
    const assetExists = await prisma.asset.findUnique({
      where: { id: assetId }
    });
    
    if (!assetExists) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    // Basic validation
    if (!body.name || !body.assetTag || !body.categoryId) {
      return NextResponse.json(
        { error: 'Name, asset tag, and category are required' },
        { status: 400 }
      );
    }
    
    // Check if updated asset tag already exists (but not for this asset)
    if (body.assetTag !== assetExists.assetTag) {
      const existingAsset = await prisma.asset.findUnique({
        where: { assetTag: body.assetTag }
      });
  
      if (existingAsset) {
        return NextResponse.json(
          { error: 'An asset with this tag already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update asset
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
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
        serviceSchedule: true,
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Asset updated successfully', 
        asset: updatedAsset 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// DELETE an asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    
    // Check if asset exists
    const assetExists = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        maintenanceRecords: true,
        checkoutHistory: true,
        serviceSchedule: {
          include: {
            serviceRecords: true
          }
        }
      }
    });
    
    if (!assetExists) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    // Check if asset has associated records
    if (assetExists.maintenanceRecords.length > 0 || 
        assetExists.checkoutHistory.length > 0 || 
        (assetExists.serviceSchedule?.serviceRecords.length ?? 0) > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete asset with associated maintenance, checkout, or service records.', 
          maintenanceCount: assetExists.maintenanceRecords.length,
          checkoutCount: assetExists.checkoutHistory.length,
          serviceRecordCount: assetExists.serviceSchedule?.serviceRecords.length ?? 0
        },
        { status: 400 }
      );
    }
    
    // Delete any service schedule without records
    if (assetExists.serviceSchedule && assetExists.serviceSchedule.serviceRecords.length === 0) {
      await prisma.serviceSchedule.delete({
        where: { id: assetExists.serviceSchedule.id }
      });
    }
    
    // Delete asset
    await prisma.asset.delete({
      where: { id: assetId }
    });
    
    return NextResponse.json(
      { message: 'Asset deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}