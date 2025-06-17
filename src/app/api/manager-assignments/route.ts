import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';

// GET /api/manager-assignments - Get manager assignments
// Super Admins can see all assignments, Managers can only see their own
export const GET = withRole(['SUPER_ADMIN', 'MANAGER'])(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');
    const isActive = searchParams.get('isActive');

    const whereClause: any = {};
    
    // Role-based access control
    if (request.user!.role === 'MANAGER') {
      // Managers can only access their own assignments
      whereClause.userId = request.user!.userId;
    } else if (request.user!.role === 'SUPER_ADMIN') {
      // Super admins can access all assignments with optional filtering
      if (companyId) {
        whereClause.companyId = companyId;
      }
      
      if (userId) {
        whereClause.userId = userId;
      }
    }
    
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    const assignments = await prisma.managerAssignment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            location: true,
            status: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching manager assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manager assignments' },
      { status: 500 }
    );
  }
});

// POST /api/manager-assignments - Create a new manager assignment (Super Admin only)
export const POST = withRole(['SUPER_ADMIN'])(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { userId, companyId, platforms = [], permissions = {} } = body;

    // Validate required fields
    if (!userId || !companyId) {
      return NextResponse.json(
        { error: 'userId and companyId are required' },
        { status: 400 }
      );
    }

    // Check if the user exists and has MANAGER role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, firstName: true, lastName: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'User must have MANAGER role to be assigned to a company' },
        { status: 400 }
      );
    }

    // Check if the company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.managerAssignment.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Manager is already assigned to this company' },
        { status: 400 }
      );
    }

    // Create the assignment
    const assignment = await prisma.managerAssignment.create({
      data: {
        userId,
        companyId,
        platforms,
        permissions,
        assignedBy: request.user!.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            location: true,
            status: true,
          },
        },
      },
    });

    // Also update the user's assignedCompanyId for backward compatibility
    await prisma.user.update({
      where: { id: userId },
      data: { assignedCompanyId: companyId },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error creating manager assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create manager assignment' },
      { status: 500 }
    );
  }
});

// DELETE /api/manager-assignments - Remove a manager assignment (Super Admin only)
export const DELETE = withRole(['SUPER_ADMIN'])(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');

    let whereClause: any = {};

    if (assignmentId) {
      whereClause.id = assignmentId;
    } else if (userId && companyId) {
      whereClause = {
        userId_companyId: {
          userId,
          companyId,
        },
      };
    } else {
      return NextResponse.json(
        { error: 'Either assignmentId or both userId and companyId are required' },
        { status: 400 }
      );
    }

    // Get the assignment first to update user's assignedCompanyId
    const assignment = await prisma.managerAssignment.findUnique({
      where: whereClause,
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Manager assignment not found' },
        { status: 404 }
      );
    }

    // Delete the assignment
    await prisma.managerAssignment.delete({
      where: whereClause,
    });

    // Remove the user's assignedCompanyId for backward compatibility
    await prisma.user.update({
      where: { id: assignment.userId },
      data: { assignedCompanyId: null },
    });

    return NextResponse.json({ message: 'Manager assignment removed successfully' });
  } catch (error) {
    console.error('Error deleting manager assignment:', error);
    return NextResponse.json(
      { error: 'Failed to delete manager assignment' },
      { status: 500 }
    );
  }
}); 