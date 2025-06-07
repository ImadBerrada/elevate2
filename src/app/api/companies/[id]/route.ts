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

// GET /api/companies/[id] - Get a specific company
export const GET = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const company = await prisma.company.findFirst({
      where: {
        id: params.id,
        userId: request.user!.userId,
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
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);

    // Check if company exists and belongs to user
    const existingCompany = await prisma.company.findFirst({
      where: {
        id: params.id,
        userId: request.user!.userId,
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if name is being updated and if it conflicts with another company
    if (validatedData.name && validatedData.name !== existingCompany.name) {
      const nameConflict = await prisma.company.findFirst({
        where: {
          name: validatedData.name,
          userId: request.user!.userId,
          id: { not: params.id },
        },
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
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) => {
  try {
    // Check if company exists and belongs to user
    const existingCompany = await prisma.company.findFirst({
      where: {
        id: params.id,
        userId: request.user!.userId,
      },
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
      where: { id: params.id },
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