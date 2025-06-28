import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
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

// Helper function to get manager's assigned company IDs
async function getManagerAssignedCompanyIds(userId: string): Promise<string[]> {
  const assignments = await prisma.managerAssignment.findMany({
    where: {
      userId: userId,
      isActive: true,
    },
    select: {
      companyId: true,
    },
  });
  
  const assignedCompanyIds = assignments.map(assignment => assignment.companyId);
  
  // Also check direct assignment
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { assignedCompanyId: true },
  });
  
  if (user?.assignedCompanyId) {
    assignedCompanyIds.push(user.assignedCompanyId);
  }
  
  return [...new Set(assignedCompanyIds)]; // Remove duplicates
}

// Helper function to check if user can access employee
async function canAccessEmployee(userId: string, userRole: string, employeeId: string): Promise<boolean> {
  if (userRole === 'SUPER_ADMIN') {
    return true; // Super admins can access all employees
  }
  
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { companyId: true, userId: true },
  });
  
  if (!employee) {
    return false;
  }
  
  if (userRole === 'ADMIN') {
    return employee.userId === userId;
  }
  
  if (userRole === 'MANAGER') {
    const assignedCompanyIds = await getManagerAssignedCompanyIds(userId);
    return assignedCompanyIds.includes(employee.companyId);
  }
  
  return false;
}

// GET /api/employees/[id] - Get a specific employee
export const GET = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    
    // Check if user can access this employee
    if (!(await canAccessEmployee(request.user!.userId, request.user!.role, id))) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    const employee = await prisma.employee.findUnique({
      where: { id: id },
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
      position: employee.position.includes(',') ? employee.position.split(',').map(s => s.trim()) : employee.position, // Convert comma-separated to array
      department: employee.department.includes(',') ? employee.department.split(',').map(s => s.trim()) : employee.department, // Convert comma-separated to array
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
export const PUT = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Transform skills from comma-separated string to array if needed
    if (typeof body.skills === 'string') {
      body.skills = body.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean);
    }

    // Remove fields that don't exist in the database schema
    const { employerId, ...cleanBody } = body;

    const validatedData = updateEmployeeSchema.parse(cleanBody);

    // Check if user can access this employee
    if (!(await canAccessEmployee(request.user!.userId, request.user!.role, id))) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: id },
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
          id: { not: id },
        },
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: 'Employee with this email already exists' },
          { status: 400 }
        );
      }
    }

    // If company is being changed, verify access to new company
    if (validatedData.companyId && validatedData.companyId !== existingEmployee.companyId) {
      let hasAccess = false;
      
      if (request.user!.role === 'SUPER_ADMIN') {
        hasAccess = true;
      } else if (request.user!.role === 'ADMIN') {
        const company = await prisma.company.findFirst({
          where: {
            id: validatedData.companyId,
            userId: request.user!.userId,
          },
        });
        hasAccess = !!company;
      } else if (request.user!.role === 'MANAGER') {
        const assignedCompanyIds = await getManagerAssignedCompanyIds(request.user!.userId);
        hasAccess = assignedCompanyIds.includes(validatedData.companyId);
      }

      if (!hasAccess) {
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
      where: { id: id },
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
      position: employee.position.includes(',') ? employee.position.split(',').map(s => s.trim()) : employee.position, // Convert comma-separated to array
      department: employee.department.includes(',') ? employee.department.split(',').map(s => s.trim()) : employee.department, // Convert comma-separated to array
      companyName: employee.company.name,
      actualCompanyName: employee.actualCompany?.name || null,
    };

    return NextResponse.json(employeeWithCompany);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError?.message || 'Validation failed', details: error.errors },
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
export const DELETE = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    
    // Check if user can access this employee
    if (!(await canAccessEmployee(request.user!.userId, request.user!.role, id))) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Delete the employee
    await prisma.employee.delete({
      where: { id: id },
    });

    // Update company employee count
    await prisma.company.update({
      where: { id: existingEmployee.companyId },
      data: {
        employeeCount: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}); 