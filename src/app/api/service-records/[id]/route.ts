import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a specific service record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id;
    
    const serviceRecord = await prisma.serviceRecord.findUnique({
      where: { id: recordId },
      include: {
        serviceSchedule: {
          include: {
            asset: true
          }
        }
      }
    });
    
    if (!serviceRecord) {
      return NextResponse.json(
        { error: 'Service record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ serviceRecord }, { status: 200 });
  } catch (error) {
    console.error('Error fetching service record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service record' },
      { status: 500 }
    );
  }
}

// PUT to update a service record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id;
    const body = await request.json();
    
    // Check if record exists
    const recordExists = await prisma.serviceRecord.findUnique({
      where: { id: recordId },
      include: {
        serviceSchedule: true
      }
    });
    
    if (!recordExists) {
      return NextResponse.json(
        { error: 'Service record not found' },
        { status: 404 }
      );
    }
    
    // Basic validation
    if (!body.description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }
    
    // Update service record
    const updatedRecord = await prisma.serviceRecord.update({
      where: { id: recordId },
      data: {
        serviceDate: body.serviceDate ? new Date(body.serviceDate) : recordExists.serviceDate,
        description: body.description,
        cost: body.cost !== undefined ? parseFloat(body.cost) : recordExists.cost,
        provider: body.provider !== undefined ? body.provider : recordExists.provider,
        notes: body.notes !== undefined ? body.notes : recordExists.notes,
      }
    });
    
    // If this is the most recent service and the date changed, update the service schedule
    if (recordExists.serviceSchedule.lastServiceDate && 
        recordExists.serviceDate.getTime() === recordExists.serviceSchedule.lastServiceDate.getTime() &&
        body.serviceDate) {
      
      const newServiceDate = new Date(body.serviceDate);
      
      // Calculate the next service date based on intervalMonths
      const nextServiceDate = new Date(newServiceDate);
      nextServiceDate.setMonth(nextServiceDate.getMonth() + recordExists.serviceSchedule.intervalMonths);
      
      // Update service schedule
      await prisma.serviceSchedule.update({
        where: { id: recordExists.serviceSchedule.id },
        data: {
          lastServiceDate: newServiceDate,
          nextServiceDate: nextServiceDate
        }
      });
    }
    
    return NextResponse.json(
      { 
        message: 'Service record updated successfully', 
        serviceRecord: updatedRecord 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating service record:', error);
    return NextResponse.json(
      { error: 'Failed to update service record' },
      { status: 500 }
    );
  }
}

// DELETE a service record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id;
    
    // Check if record exists
    const recordExists = await prisma.serviceRecord.findUnique({
      where: { id: recordId },
      include: {
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
    
    if (!recordExists) {
      return NextResponse.json(
        { error: 'Service record not found' },
        { status: 404 }
      );
    }
    
    // Delete the service record
    await prisma.serviceRecord.delete({
      where: { id: recordId }
    });
    
    // If this was the latest service record, update the service schedule
    if (recordExists.serviceSchedule.serviceRecords.length > 1 &&
        recordExists.serviceSchedule.serviceRecords[0].id === recordId) {
        
      // The next most recent record is now the latest
      const newLatestRecord = recordExists.serviceSchedule.serviceRecords[1];
      
      // Calculate the next service date based on intervalMonths
      const nextServiceDate = new Date(newLatestRecord.serviceDate);
      nextServiceDate.setMonth(nextServiceDate.getMonth() + recordExists.serviceSchedule.intervalMonths);
      
      // Update service schedule
      await prisma.serviceSchedule.update({
        where: { id: recordExists.serviceSchedule.id },
        data: {
          lastServiceDate: newLatestRecord.serviceDate,
          nextServiceDate: nextServiceDate
        }
      });
    } else if (recordExists.serviceSchedule.serviceRecords.length === 1) {
      // This was the only service record
      await prisma.serviceSchedule.update({
        where: { id: recordExists.serviceSchedule.id },
        data: {
          lastServiceDate: null,
        }
      });
    }
    
    return NextResponse.json(
      { message: 'Service record deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting service record:', error);
    return NextResponse.json(
      { error: 'Failed to delete service record' },
      { status: 500 }
    );
  }
}