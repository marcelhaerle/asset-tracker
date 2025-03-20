import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a specific employee by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        assignedAssets: {
          include: {
            category: true,
            location: true
          }
        },
        checkoutHistory: {
          include: {
            asset: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            checkedOutAt: 'desc'
          }
        }
      }
    });
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ employee }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PUT to update an employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    const body = await request.json();
    
    // Check if employee exists
    const employeeExists = await prisma.employee.findUnique({
      where: { id: employeeId }
    });
    
    if (!employeeExists) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Basic validation
    if (!body.firstName || !body.lastName || !body.employeeId || !body.email) {
      return NextResponse.json(
        { error: 'First name, last name, employee ID, and email are required' },
        { status: 400 }
      );
    }
    
    // Check if updated employee ID already exists (but not for this employee)
    if (body.employeeId !== employeeExists.employeeId) {
      const existingEmployee = await prisma.employee.findUnique({
        where: { employeeId: body.employeeId }
      });
  
      if (existingEmployee) {
        return NextResponse.json(
          { error: 'An employee with this employee ID already exists' },
          { status: 400 }
        );
      }
    }
    
    // Check if updated email already exists (but not for this employee)
    if (body.email !== employeeExists.email) {
      const existingEmployeeByEmail = await prisma.employee.findUnique({
        where: { email: body.email }
      });
  
      if (existingEmployeeByEmail) {
        return NextResponse.json(
          { error: 'An employee with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        employeeId: body.employeeId,
        email: body.email,
        department: body.department || null,
        position: body.position || null,
        phone: body.phone || null,
        isActive: body.isActive !== false,
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Employee updated successfully', 
        employee: updatedEmployee 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE an employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    
    // Check if employee exists
    const employeeExists = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        assignedAssets: true,
        checkoutHistory: true
      }
    });
    
    if (!employeeExists) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Check if employee has associated assets
    if (employeeExists.assignedAssets.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete employee with assigned assets.', 
          assetCount: employeeExists.assignedAssets.length
        },
        { status: 400 }
      );
    }
    
    // Check if employee has associated checkout records
    if (employeeExists.checkoutHistory.length > 0) {
      // Instead of blocking the delete, we could also implement a soft delete by setting isActive to false
      return NextResponse.json(
        { 
          error: 'Cannot delete employee with checkout history.', 
          checkoutCount: employeeExists.checkoutHistory.length 
        },
        { status: 400 }
      );
    }
    
    // Delete employee
    await prisma.employee.delete({
      where: { id: employeeId }
    });
    
    return NextResponse.json(
      { message: 'Employee deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}