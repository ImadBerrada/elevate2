import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import bcrypt from 'bcryptjs';

// GET /api/managers - Get all users with MANAGER role (Super Admin only)
export const GET = withRole(['SUPER_ADMIN'])(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const includeAssigned = searchParams.get('includeAssigned') === 'true';
    const companyId = searchParams.get('companyId');

    let whereClause: any = {
      role: 'MANAGER',
    };

    // If we don't want to include already assigned managers, filter them out
    if (!includeAssigned) {
      whereClause.assignedCompanyId = null;
    }

    // If filtering for a specific company, include only those assigned to it
    if (companyId) {
      whereClause.assignedCompanyId = companyId;
    }

    const managers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
        assignedCompanyId: true,
        createdAt: true,
        updatedAt: true,
        assignedCompany: {
          select: {
            id: true,
            name: true,
            industry: true,
            location: true,
            status: true,
          },
        },
        managerAssignments: {
          where: {
            isActive: true,
          },
          include: {
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
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return NextResponse.json({ managers });
  } catch (error) {
    console.error('Error fetching managers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch managers' },
      { status: 500 }
    );
  }
});

// POST /api/managers - Create a new manager (Super Admin only)
export const POST = withRole(['SUPER_ADMIN'])(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      avatar, 
      companyId, // Legacy single company support
      companyIds = [], // New multiple companies support
      platforms = [],
      permissions = {} 
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'firstName, lastName, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine which companies to assign
    const companiesToAssign = companyIds.length > 0 ? companyIds : (companyId ? [companyId] : []);

    // Create user with MANAGER role
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar,
        role: 'MANAGER',
        // For backward compatibility, set assignedCompanyId to the first company if any
        assignedCompanyId: companiesToAssign.length > 0 ? companiesToAssign[0] : null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
        assignedCompanyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

        // Create manager assignments for all selected companies
    if (companiesToAssign.length > 0) {
      const assignmentPromises = companiesToAssign.map((companyId: string) =>
        prisma.managerAssignment.create({
          data: {
            userId: user.id,
            companyId,
            platforms,
            permissions,
            assignedBy: request.user!.userId,
          },
        })
      );

      await Promise.all(assignmentPromises);
    }

    // Fetch the created user with assignments for response
    const userWithAssignments = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
        assignedCompanyId: true,
        createdAt: true,
        updatedAt: true,
        managerAssignments: {
          where: {
            isActive: true,
          },
          include: {
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
        },
      },
    });

    return NextResponse.json(userWithAssignments, { status: 201 });
  } catch (error) {
    console.error('Error creating manager:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('P2002')) {
        return NextResponse.json(
          { error: 'A manager assignment for this user and company already exists' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create manager' },
      { status: 500 }
    );
  }
}); 