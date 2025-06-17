import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';

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

// GET /api/companies/list - Get simplified list of companies for assignment
export const GET = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(async (request: AuthenticatedRequest) => {
  try {
    let where: any = {
      status: 'ACTIVE', // Only show active companies
    };

    // Role-based filtering
    if (request.user!.role === 'SUPER_ADMIN') {
      // Super admins can see all companies
    } else if (request.user!.role === 'ADMIN') {
      // Admins can see their own companies
      where.userId = request.user!.userId;
    } else if (request.user!.role === 'MANAGER') {
      // Managers can only see their assigned companies
      const assignedCompanyIds = await getManagerAssignedCompanyIds(request.user!.userId);
      
      if (assignedCompanyIds.length === 0) {
        // Manager has no assigned companies, return empty result
        return NextResponse.json({ companies: [] });
      }
      
      where.id = {
        in: assignedCompanyIds,
      };
    }
    
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        industry: true,
        location: true,
        status: true,
      },
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Error fetching companies list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}); 