import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';

const visaSchema = z.object({
  visaNumber: z.string().optional(),
  visaType: z.string().optional(),
  issueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  expiryDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  sponsor: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional().transform(val => val ? new Date(val) : undefined),
  emiratesId: z.string().optional(),
  emiratesIdExpiry: z.string().optional().transform(val => val ? new Date(val) : undefined),
  laborCardNumber: z.string().optional(),
  laborCardExpiry: z.string().optional().transform(val => val ? new Date(val) : undefined),
  visaDocument: z.string().optional(),
  passportDocument: z.string().optional(),
  emiratesIdDocument: z.string().optional(),
  laborCardDocument: z.string().optional(),
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

async function handler(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employeeId = id;
  const userId = request.user!.userId;
  const userRole = request.user!.role;

  // Check if user can access this employee
  if (!(await canAccessEmployee(userId, userRole, employeeId))) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  // Verify employee exists
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  if (request.method === 'GET') {
    try {
      const visa = await prisma.employeeVisa.findUnique({
        where: { employeeId },
      });

      return NextResponse.json(visa);
    } catch (error) {
      console.error('Error fetching visa:', error);
      return NextResponse.json({ error: 'Failed to fetch visa' }, { status: 500 });
    }
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const body = await request.json();
      const validatedData = visaSchema.parse(body);

      const visa = await prisma.employeeVisa.upsert({
        where: { employeeId },
        update: validatedData,
        create: {
          employeeId,
          ...validatedData,
        },
      });

      return NextResponse.json(visa);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
      }
      console.error('Error saving visa:', error);
      return NextResponse.json({ error: 'Failed to save visa' }, { status: 500 });
    }
  }

  if (request.method === 'DELETE') {
    try {
      await prisma.employeeVisa.delete({
        where: { employeeId },
      });

      return NextResponse.json({ message: 'Visa deleted successfully' });
    } catch (error) {
      console.error('Error deleting visa:', error);
      return NextResponse.json({ error: 'Failed to delete visa' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(handler);
export const POST = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(handler);
export const PUT = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(handler);
export const DELETE = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(handler); 