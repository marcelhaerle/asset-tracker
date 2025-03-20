import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        lastName: 'asc'
      }
    });
    
    return NextResponse.json({ employees }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.employeeId || !body.email) {
      return NextResponse.json(
        { error: 'First name, last name, employee ID, and email are required' },
        { status: 400 }
      );
    }

    // Check if the employee ID already exists
    const existingEmployeeById = await prisma.employee.findUnique({
      where: { employeeId: body.employeeId }
    });

    if (existingEmployeeById) {
      return NextResponse.json(
        { error: 'An employee with this employee ID already exists' },
        { status: 400 }
      );
    }

    // Check if the email already exists
    const existingEmployeeByEmail = await prisma.employee.findUnique({
      where: { email: body.email }
    });

    if (existingEmployeeByEmail) {
      return NextResponse.json(
        { error: 'An employee with this email already exists' },
        { status: 400 }
      );
    }

    // Create the employee
    const employee = await prisma.employee.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        employeeId: body.employeeId,
        email: body.email,
        department: body.department || null,
        position: body.position || null,
        phone: body.phone || null,
        isActive: body.isActive !== false, // Default to true if not provided
      }
    });

    return NextResponse.json(
      { message: 'Employee created successfully', employee },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}