import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a specific checkout record
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const checkoutId = (await params).id;

    const checkoutRecord = await prisma.checkoutRecord.findUnique({
      where: { id: checkoutId },
      include: {
        asset: {
          include: {
            category: true,
          },
        },
        employee: true,
      },
    });

    if (!checkoutRecord) {
      return NextResponse.json({ error: 'Checkout record not found' }, { status: 404 });
    }

    return NextResponse.json({ checkoutRecord }, { status: 200 });
  } catch (error) {
    console.error('Error fetching checkout record:', error);
    return NextResponse.json({ error: 'Failed to fetch checkout record' }, { status: 500 });
  }
}

// PUT to update a checkout record (mainly for checking in an asset)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const checkoutId = (await params).id;
    const body = await request.json();

    // Check if the checkout record exists
    const checkoutRecord = await prisma.checkoutRecord.findUnique({
      where: { id: checkoutId },
      include: {
        asset: true,
      },
    });

    if (!checkoutRecord) {
      return NextResponse.json({ error: 'Checkout record not found' }, { status: 404 });
    }

    // Check if the asset is already returned
    if (checkoutRecord.returnedAt) {
      return NextResponse.json({ error: 'Asset is already checked in' }, { status: 400 });
    }

    // If action is check-in, mark the asset as returned
    if (body.action === 'check-in') {
      // Update the checkout record with return date
      const updatedCheckout = await prisma.checkoutRecord.update({
        where: { id: checkoutId },
        data: {
          returnedAt: new Date(),
          notes: body.notes
            ? `${checkoutRecord.notes ? checkoutRecord.notes + ' | ' : ''}${body.notes}`
            : checkoutRecord.notes,
        },
        include: {
          asset: true,
          employee: true,
        },
      });

      // Update the asset status back to available and remove assignment
      await prisma.asset.update({
        where: { id: checkoutRecord.assetId },
        data: {
          status: 'AVAILABLE',
          assignedToId: null,
        },
      });

      return NextResponse.json(
        { message: 'Asset checked in successfully', checkoutRecord: updatedCheckout },
        { status: 200 }
      );
    } else {
      // Just updating notes or other fields
      const updatedCheckout = await prisma.checkoutRecord.update({
        where: { id: checkoutId },
        data: {
          notes: body.notes || checkoutRecord.notes,
        },
        include: {
          asset: true,
          employee: true,
        },
      });

      return NextResponse.json(
        { message: 'Checkout record updated successfully', checkoutRecord: updatedCheckout },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error updating checkout record:', error);
    return NextResponse.json({ error: 'Failed to update checkout record' }, { status: 500 });
  }
}

// DELETE a checkout record (normally should not be needed but provided for completeness)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const checkoutId = (await params).id;

    // Check if the checkout record exists
    const checkoutRecord = await prisma.checkoutRecord.findUnique({
      where: { id: checkoutId },
    });

    if (!checkoutRecord) {
      return NextResponse.json({ error: 'Checkout record not found' }, { status: 404 });
    }

    // Verify the record can be deleted (only if it's a mistaken entry)
    // In a real-world scenario, you might want additional checks or logging

    // Delete the checkout record
    await prisma.checkoutRecord.delete({
      where: { id: checkoutId },
    });

    return NextResponse.json({ message: 'Checkout record deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting checkout record:', error);
    return NextResponse.json({ error: 'Failed to delete checkout record' }, { status: 500 });
  }
}
