import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.location.findMany();
    return NextResponse.json({ locations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      );
    }

    // Create new location
    const newLocation = await prisma.location.create({
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
        message: 'Location created successfully', 
        location: newLocation 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}