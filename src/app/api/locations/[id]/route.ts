import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a specific location by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const locationId = params.id;
    
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        assets: {
          include: {
            category: true
          }
        }
      }
    });
    
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ location }, { status: 200 });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

// PUT to update a location
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const locationId = params.id;
    const body = await request.json();
    
    // Check if location exists
    const locationExists = await prisma.location.findUnique({
      where: { id: locationId }
    });
    
    if (!locationExists) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }
    
    // Basic validation
    if (!body.name) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      );
    }
    
    // Update location
    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        name: body.name,
        description: body.description || null,
        address: body.address || null,
        building: body.building || null,
        floor: body.floor || null,
        room: body.room || null,
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Location updated successfully', 
        location: updatedLocation 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

// DELETE a location
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const locationId = params.id;
    
    // Check if location exists
    const locationExists = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        assets: true
      }
    });
    
    if (!locationExists) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }
    
    // Check if location has assets
    if (locationExists.assets.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete location with associated assets. Please reassign or remove assets first.', 
          assetCount: locationExists.assets.length 
        },
        { status: 400 }
      );
    }
    
    // Delete location
    await prisma.location.delete({
      where: { id: locationId }
    });
    
    return NextResponse.json(
      { message: 'Location deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}