import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { z } from 'zod';

// Validation schema for company updates
const updateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  description: z.string().optional(),
  industry: z.string().min(1, 'Industry is required').optional(),
  size: z.string().optional(),
  location: z.string().min(1, 'Location is required').optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().min(1, 'Phone is required').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  revenue: z.string().optional(),
  logo: z.string().optional(),
});

// Helper function to check if user can access company
async function canAccessCompany(userId: string, companyId: string, userRole: string): Promise<boolean> {
  if (userRole === 'SUPER_ADMIN') {
    // Super admins can access all companies
    return true;
  } else if (userRole === 'ADMIN') {
    // Admins can access companies they own
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        userId: userId,
      },
    });
    return !!company;
  } else if (userRole === 'MANAGER') {
    // Managers can access companies they are assigned to
    const assignment = await prisma.managerAssignment.findFirst({
      where: {
        userId: userId,
        companyId: companyId,
        isActive: true,
      },
    });
    return !!assignment;
  }
  
  return false;
}

// GET /api/companies/[id] - Get a specific company
export const GET = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const userId = request.user!.userId;
    const userRole = request.user!.role;
    
    // Check if user can access this company
    const hasAccess = await canAccessCompany(userId, id, userRole);
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    const company = await prisma.company.findUnique({
      where: {
        id: id,
      },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            department: true,
            status: true,
            startDate: true,
          },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Transform response
    const companyWithCount = {
      ...company,
      employeeCount: company._count.employees,
      _count: undefined,
    };

    return NextResponse.json(companyWithCount);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
});

// PUT /api/companies/[id] - Update a specific company
export const PUT = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);
    const userId = request.user!.userId;
    const userRole = request.user!.role;

    // Check if user can access this company
    const hasAccess = await canAccessCompany(userId, id, userRole);
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // For managers, check if they have modify permissions
    if (userRole === 'MANAGER') {
      const assignment = await prisma.managerAssignment.findFirst({
        where: {
          userId: userId,
          companyId: id,
          isActive: true,
        },
      });
      
      const permissions = assignment?.permissions as { canModifyCompanies?: boolean } | null;
      if (!assignment || !permissions?.canModifyCompanies) {
        return NextResponse.json(
          { error: 'Access denied. You do not have permission to modify this company.' },
          { status: 403 }
        );
      }
    }

    // Get existing company for validation
    const existingCompany = await prisma.company.findUnique({
      where: { id: id },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if name is being updated and if it conflicts with another company
    if (validatedData.name && validatedData.name !== existingCompany.name) {
      let nameConflictWhere: any = {
        name: validatedData.name,
        id: { not: id },
      };
      
      // For admins, only check within their own companies
      if (userRole === 'ADMIN') {
        nameConflictWhere.userId = userId;
      }
      
      const nameConflict = await prisma.company.findFirst({
        where: nameConflictWhere,
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Company with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Update the company
    const company = await prisma.company.update({
      where: { id: id },
      data: validatedData,
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    // Transform response
    const companyWithCount = {
      ...company,
      employeeCount: company._count.employees,
      _count: undefined,
    };

    return NextResponse.json(companyWithCount);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
});

// DELETE /api/companies/[id] - Delete a specific company
export const DELETE = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const userId = request.user!.userId;
    const userRole = request.user!.role;
    
    // Check if user can access this company
    const hasAccess = await canAccessCompany(userId, id, userRole);
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // For managers, check if they have delete permissions
    if (userRole === 'MANAGER') {
      const assignment = await prisma.managerAssignment.findFirst({
        where: {
          userId: userId,
          companyId: id,
          isActive: true,
        },
      });
      
      const permissions = assignment?.permissions as { canDeleteCompanies?: boolean } | null;
      if (!assignment || !permissions?.canDeleteCompanies) {
        return NextResponse.json(
          { error: 'Access denied. You do not have permission to delete this company.' },
          { status: 403 }
        );
      }
    }

    // Get existing company
    const existingCompany = await prisma.company.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if company has employees
    if (existingCompany._count.employees > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete company with employees. Please remove all employees first.',
          employeeCount: existingCompany._count.employees 
        },
        { status: 400 }
      );
    }

    // Delete the company
    await prisma.company.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}); 