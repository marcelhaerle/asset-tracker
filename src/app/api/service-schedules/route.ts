import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const dueSoon = searchParams.get('dueSoon') === 'true';

    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const whereClause: {
      assetId?: string;
      nextServiceDate?: { lte: Date };
      enabled?: boolean;
    } = {};

    if (assetId) {
      whereClause.assetId = assetId;
    }

    if (dueSoon) {
      whereClause.nextServiceDate = {
        lte: endOfMonth,
      };
      whereClause.enabled = true;
    }

    const serviceSchedules = await prisma.serviceSchedule.findMany({
      where: whereClause,
      include: {
        asset: {
          include: {
            category: true,
            location: true,
            assignedTo: true,
          },
        },
        serviceRecords: {
          orderBy: {
            serviceDate: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        nextServiceDate: 'asc',
      },
    });

    return NextResponse.json({ serviceSchedules }, { status: 200 });
  } catch (error) {
    console.error('Error fetching service schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch service schedules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.assetId || !body.intervalMonths || !body.nextServiceDate) {
      return NextResponse.json(
        { error: 'Asset ID, interval months, and next service date are required' },
        { status: 400 }
      );
    }

    // Check if the asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: body.assetId },
      include: { serviceSchedule: true },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Check if the asset already has a service schedule
    if (asset.serviceSchedule) {
      return NextResponse.json({ error: 'Asset already has a service schedule' }, { status: 400 });
    }

    // Validate intervalMonths
    if (![3, 6, 12].includes(body.intervalMonths)) {
      return NextResponse.json({ error: 'Interval months must be 3, 6, or 12' }, { status: 400 });
    }

    // Create service schedule
    const newSchedule = await prisma.serviceSchedule.create({
      data: {
        assetId: body.assetId,
        enabled: body.enabled !== undefined ? body.enabled : true,
        intervalMonths: body.intervalMonths,
        lastServiceDate: body.lastServiceDate ? new Date(body.lastServiceDate) : null,
        nextServiceDate: new Date(body.nextServiceDate),
        notes: body.notes || null,
      },
      include: {
        asset: true,
        serviceRecords: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Service schedule created successfully',
        serviceSchedule: newSchedule,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service schedule:', error);
    return NextResponse.json({ error: 'Failed to create service schedule' }, { status: 500 });
  }
}
