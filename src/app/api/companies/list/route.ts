import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

// GET /api/companies/list - Get a simple list of companies for dropdowns
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const companies = await prisma.company.findMany({
      where: {
        userId: request.user!.userId,
        status: 'ACTIVE', // Only return active companies
      },
      select: {
        id: true,
        name: true,
        industry: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Error fetching companies list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies list' },
      { status: 500 }
    );
  }
}); 