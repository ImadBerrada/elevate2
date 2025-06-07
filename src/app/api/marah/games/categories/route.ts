import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Verify company belongs to user
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        userId: request.user!.userId,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get categories with game counts
    const categories = await prisma.marahGame.groupBy({
      by: ['category'],
      where: { 
        companyId,
        isAvailable: true, // Only count available games
      },
      _count: { 
        category: true 
      },
      orderBy: {
        category: 'asc',
      },
    });

    const formattedCategories = categories.map(cat => ({
      id: cat.category,
      name: cat.category,
      count: cat._count.category,
    }));

    return NextResponse.json({
      categories: formattedCategories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler); 