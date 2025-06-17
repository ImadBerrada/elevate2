import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { employerSchema } from '@/lib/validations';

// GET /api/employers/[id] - Get a specific employer
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const employer = await prisma.employer.findFirst({
      where: {
        id: id,
        userId: request.user!.userId,
      },
    });

    if (!employer) {
      return NextResponse.json(
        { error: 'Employer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employer);
  } catch (error) {
    console.error('Get employer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employer' },
      { status: 500 }
    );
  }
});

// PUT /api/employers/[id] - Update a specific employer
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validatedData = employerSchema.parse(body);
    
    // Check if employer exists and belongs to user
    const existingEmployer = await prisma.employer.findFirst({
      where: {
        id: id,
        userId: request.user!.userId,
      },
    });

    if (!existingEmployer) {
      return NextResponse.json(
        { error: 'Employer not found' },
        { status: 404 }
      );
    }
    
    // Update employer
    const employer = await prisma.employer.update({
      where: { id: id },
      data: validatedData,
    });
    
    return NextResponse.json(employer);
  } catch (error) {
    console.error('Update employer error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update employer' },
      { status: 500 }
    );
  }
});

// DELETE /api/employers/[id] - Delete a specific employer
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    // Check if employer exists and belongs to user
    const existingEmployer = await prisma.employer.findFirst({
      where: {
        id: id,
        userId: request.user!.userId,
      },
    });

    if (!existingEmployer) {
      return NextResponse.json(
        { error: 'Employer not found' },
        { status: 404 }
      );
    }
    
    // Delete employer
    await prisma.employer.delete({
      where: { id: id },
    });
    
    return NextResponse.json({ message: 'Employer deleted successfully' });
  } catch (error) {
    console.error('Delete employer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete employer' },
      { status: 500 }
    );
  }
}); 