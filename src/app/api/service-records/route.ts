import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET service records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');
    
    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Service schedule ID is required' },
        { status: 400 }
      );
    }
    
    const serviceRecords = await prisma.serviceRecord.findMany({
      where: {
        serviceScheduleId: scheduleId
      },
      orderBy: {
        serviceDate: 'desc'
      }
    });
    
    return NextResponse.json({ serviceRecords }, { status: 200 });
  } catch (error) {
    console.error('Error fetching service records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service records' },
      { status: 500 }
    );
  }
}

// POST to create a new service record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.serviceScheduleId || !body.serviceDate || !body.description) {
      return NextResponse.json(
        { error: 'Service schedule ID, service date, and description are required' },
        { status: 400 }
      );
    }
    
    // Check if the service schedule exists
    const schedule = await prisma.serviceSchedule.findUnique({
      where: { id: body.serviceScheduleId },
      include: { asset: true }
    });
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'Service schedule not found' },
        { status: 404 }
      );
    }
    
    // Create service record
    const newRecord = await prisma.serviceRecord.create({
      data: {
        serviceScheduleId: body.serviceScheduleId,
        serviceDate: new Date(body.serviceDate),
        description: body.description,
        cost: body.cost ? parseFloat(body.cost) : null,
        provider: body.provider || null,
        notes: body.notes || null,
      }
    });
    
    // Update the service schedule with the new last service date
    const serviceDate = new Date(body.serviceDate);
    
    // Calculate the next service date based on intervalMonths
    const nextServiceDate = new Date(serviceDate);
    nextServiceDate.setMonth(nextServiceDate.getMonth() + schedule.intervalMonths);
    
    // Update service schedule
    await prisma.serviceSchedule.update({
      where: { id: body.serviceScheduleId },
      data: {
        lastServiceDate: serviceDate,
        nextServiceDate: nextServiceDate
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Service record created successfully', 
        serviceRecord: newRecord 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service record:', error);
    return NextResponse.json(
      { error: 'Failed to create service record' },
      { status: 500 }
    );
  }
}