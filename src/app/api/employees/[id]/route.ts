import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { z } from 'zod';

// Validation schema for employee updates
const updateEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required').optional(),
  role: z.string().optional(),
  companyId: z.string().min(1, 'Company is required').optional(),
  actualCompanyId: z.string().optional(),
  salary: z.string().optional(),
  actualSalary: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).optional(),
  location: z.string().optional(),
  manager: z.string().optional(),
  skills: z.array(z.string()).optional(),
  avatar: z.string().optional(),
});

// GET /api/employees/[id] - Get a specific employee
export const GET = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const employee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        userId: request.user!.userId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            location: true,
          },
        },
        actualCompany: {
          select: {
            id: true,
            name: true,
          },
        },
        visa: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Transform response and map position to role
    const employeeWithCompany = {
      ...employee,
      role: employee.position, // Map position to role for frontend
      companyName: employee.company.name,
      actualCompanyName: employee.actualCompany?.name,
    };

    return NextResponse.json(employeeWithCompany);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
});

// PUT /api/employees/[id] - Update a specific employee
export const PUT = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json();
    
    // Transform skills from comma-separated string to array if needed
    if (typeof body.skills === 'string') {
      body.skills = body.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean);
    }

    // Remove fields that don't exist in the database schema
    const { employerId, ...cleanBody } = body;

    const validatedData = updateEmployeeSchema.parse(cleanBody);

    // Check if employee exists and belongs to user
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        userId: request.user!.userId,
      },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if email is being updated and if it conflicts with another employee
    if (validatedData.email && validatedData.email !== existingEmployee.email) {
      const emailConflict = await prisma.employee.findFirst({
        where: {
          email: validatedData.email,
          id: { not: params.id },
        },
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: 'Employee with this email already exists' },
          { status: 400 }
        );
      }
    }

    // If company is being changed, verify the new company exists and belongs to user
    if (validatedData.companyId && validatedData.companyId !== existingEmployee.companyId) {
      const newCompany = await prisma.company.findFirst({
        where: {
          id: validatedData.companyId,
          userId: request.user!.userId,
        },
      });

      if (!newCompany) {
        return NextResponse.json(
          { error: 'New company not found or access denied' },
          { status: 400 }
        );
      }

      // Update employee counts for both companies
      await Promise.all([
        // Decrement old company
        prisma.company.update({
          where: { id: existingEmployee.companyId },
          data: { employeeCount: { decrement: 1 } },
        }),
        // Increment new company
        prisma.company.update({
          where: { id: validatedData.companyId },
          data: { employeeCount: { increment: 1 } },
        }),
      ]);
    }

    // Update the employee with role to position mapping
    const { role, ...employeeData } = validatedData;
    const updateData = {
      ...employeeData,
      ...(role && { position: role }), // Map role to position if role is provided
    };

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            location: true,
          },
        },
        actualCompany: {
          select: {
            id: true,
            name: true,
          },
        },
        visa: true,
      },
    });

    // Transform response and map position to role
    const employeeWithCompany = {
      ...employee,
      role: employee.position, // Map position to role for frontend
      companyName: employee.company.name,
      actualCompanyName: employee.actualCompany?.name,
    };

    return NextResponse.json(employeeWithCompany);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
});

// DELETE /api/employees/[id] - Delete a specific employee
export const DELETE = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // Check if employee exists and belongs to user
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        userId: request.user!.userId,
      },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Delete the employee and update company employee count
    await Promise.all([
      prisma.employee.delete({
        where: { id: params.id },
      }),
      prisma.company.update({
        where: { id: existingEmployee.companyId },
        data: { employeeCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}); 