import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

// GET /api/debug/user-companies - Debug what companies a user should see
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user!.userId;
    
    // Get user details with all assignments
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        assignedCompanyId: true,
        assignedCompany: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
        managerAssignments: {
          where: { isActive: true },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                industry: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine what companies user should see
    let allowedCompanyIds: string[] = [];
    let reasoning = '';

    if (user.role === 'SUPER_ADMIN') {
      reasoning = 'Super admin can see all companies';
      const allCompanies = await prisma.company.findMany({
        select: { id: true, name: true, industry: true },
      });
      allowedCompanyIds = allCompanies.map(c => c.id);
    } else if (user.role === 'MANAGER') {
      reasoning = 'Manager can see assigned companies';
      
      // Add direct assigned company
      if (user.assignedCompanyId) {
        allowedCompanyIds.push(user.assignedCompanyId);
      }
      
      // Add companies from manager assignments
      if (user.managerAssignments) {
        allowedCompanyIds.push(...user.managerAssignments.map(assignment => assignment.company.id));
      }
      
      // Remove duplicates
      allowedCompanyIds = [...new Set(allowedCompanyIds)];
    } else if (user.role === 'ADMIN') {
      reasoning = 'Admin can see companies they created';
      const userCompanies = await prisma.company.findMany({
        where: { userId },
        select: { id: true, name: true, industry: true },
      });
      allowedCompanyIds = userCompanies.map(c => c.id);
    } else {
      reasoning = 'Regular user can see companies they created';
      const userCompanies = await prisma.company.findMany({
        where: { userId },
        select: { id: true, name: true, industry: true },
      });
      allowedCompanyIds = userCompanies.map(c => c.id);
    }

    // Get the actual companies
    const allowedCompanies = await prisma.company.findMany({
      where: {
        id: { in: allowedCompanyIds },
      },
      select: {
        id: true,
        name: true,
        industry: true,
        status: true,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        assignedCompanyId: user.assignedCompanyId,
        assignedCompany: user.assignedCompany,
        managerAssignments: user.managerAssignments,
      },
      reasoning,
      allowedCompanyIds,
      allowedCompanies,
      companiesCount: allowedCompanies.length,
    });
  } catch (error) {
    console.error('Debug user companies error:', error);
    return NextResponse.json(
      { error: 'Failed to debug user companies' },
      { status: 500 }
    );
  }
}); 