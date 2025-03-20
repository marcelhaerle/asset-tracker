import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all checkout records
export async function GET() {
  try {
    const checkoutRecords = await prisma.checkoutRecord.findMany({
      include: {
        asset: {
          include: {
            category: true
          }
        },
        employee: true
      },
      orderBy: {
        checkedOutAt: 'desc'
      }
    });
    
    return NextResponse.json({ checkoutRecords }, { status: 200 });
  } catch (error) {
    console.error('Error fetching checkout records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checkout records' },
      { status: 500 }
    );
  }
}

// POST to create a new checkout record (check out)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.assetId || !body.employeeId) {
      return NextResponse.json(
        { error: 'Asset ID and Employee ID are required' },
        { status: 400 }
      );
    }
    
    // Check if the asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: body.assetId },
      include: {
        checkoutHistory: {
          where: {
            returnedAt: null
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
    
    // Check if the asset is already checked out
    if (asset.checkoutHistory.length > 0) {
      return NextResponse.json(
        { error: 'Asset is already checked out' },
        { status: 400 }
      );
    }
    
    // Check if the employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: body.employeeId }
    });
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Create the checkout record
    const checkoutRecord = await prisma.checkoutRecord.create({
      data: {
        checkedOutAt: new Date(),
        notes: body.notes || null,
        assetId: body.assetId,
        employeeId: body.employeeId
      },
      include: {
        asset: true,
        employee: true
      }
    });
    
    // Update the asset status and assignment
    await prisma.asset.update({
      where: { id: body.assetId },
      data: {
        status: 'IN_USE',
        assignedToId: body.employeeId
      }
    });
    
    return NextResponse.json(
      { message: 'Asset checked out successfully', checkoutRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error checking out asset:', error);
    return NextResponse.json(
      { error: 'Failed to check out asset' },
      { status: 500 }
    );
  }
}