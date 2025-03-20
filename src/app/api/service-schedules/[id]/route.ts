import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a specific service schedule by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = params.id;
    
    const serviceSchedule = await prisma.serviceSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        asset: {
          include: {
            category: true,
            location: true
          }
        },
        serviceRecords: {
          orderBy: {
            serviceDate: 'desc'
          }
        }
      }
    });
    
    if (!serviceSchedule) {
      return NextResponse.json(
        { error: 'Service schedule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ serviceSchedule }, { status: 200 });
  } catch (error) {
    console.error('Error fetching service schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service schedule' },
      { status: 500 }
    );
  }
}

// PUT to update a service schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = params.id;
    const body = await request.json();
    
    // Check if schedule exists
    const scheduleExists = await prisma.serviceSchedule.findUnique({
      where: { id: scheduleId }
    });
    
    if (!scheduleExists) {
      return NextResponse.json(
        { error: 'Service schedule not found' },
        { status: 404 }
      );
    }
    
    // Validate intervalMonths
    if (body.intervalMonths && ![3, 6, 12].includes(body.intervalMonths)) {
      return NextResponse.json(
        { error: 'Interval months must be 3, 6, or 12' },
        { status: 400 }
      );
    }
    
    // Update the schedule
    const updatedSchedule = await prisma.serviceSchedule.update({
      where: { id: scheduleId },
      data: {
        enabled: body.enabled !== undefined ? body.enabled : scheduleExists.enabled,
        intervalMonths: body.intervalMonths || scheduleExists.intervalMonths,
        lastServiceDate: body.lastServiceDate ? new Date(body.lastServiceDate) : scheduleExists.lastServiceDate,
        nextServiceDate: body.nextServiceDate ? new Date(body.nextServiceDate) : scheduleExists.nextServiceDate,
        notes: body.notes !== undefined ? body.notes : scheduleExists.notes,
      },
      include: {
        asset: true,
        serviceRecords: {
          orderBy: {
            serviceDate: 'desc'
          }
        }
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Service schedule updated successfully', 
        serviceSchedule: updatedSchedule 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating service schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update service schedule' },
      { status: 500 }
    );
  }
}

// DELETE a service schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = params.id;
    
    // Check if schedule exists
    const scheduleExists = await prisma.serviceSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        serviceRecords: true
      }
    });
    
    if (!scheduleExists) {
      return NextResponse.json(
        { error: 'Service schedule not found' },
        { status: 404 }
      );
    }
    
    // Check if there are associated service records
    if (scheduleExists.serviceRecords.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete service schedule with associated service records', 
          recordCount: scheduleExists.serviceRecords.length 
        },
        { status: 400 }
      );
    }
    
    // Delete the service schedule
    await prisma.serviceSchedule.delete({
      where: { id: scheduleId }
    });
    
    return NextResponse.json(
      { message: 'Service schedule deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting service schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete service schedule' },
      { status: 500 }
    );
  }
}