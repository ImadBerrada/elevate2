import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

// GET /api/stats - Get dashboard statistics for the authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user!.userId;
    
    // Get current date and date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Parallel queries for better performance
    const [
      totalActivities,
      todayActivities,
      weekActivities,
      monthActivities,
      totalContacts,
      vipContacts,
      totalBusinesses,
      activeBusinesses,
      totalEmployers,
      activeEmployers,
      totalPoints,
      monthPoints,
    ] = await Promise.all([
      // Activities
      prisma.activity.count({ where: { userId } }),
      prisma.activity.count({ 
        where: { 
          userId, 
          createdAt: { gte: startOfToday } 
        } 
      }),
      prisma.activity.count({ 
        where: { 
          userId, 
          createdAt: { gte: startOfWeek } 
        } 
      }),
      prisma.activity.count({ 
        where: { 
          userId, 
          createdAt: { gte: startOfMonth } 
        } 
      }),
      
      // Contacts
      prisma.contact.count({ where: { userId } }),
      prisma.contact.count({ 
        where: { 
          userId, 
          rating: { gte: 3 } 
        } 
      }),
      
      // Businesses
      prisma.business.count({ where: { userId } }),
      prisma.business.count({ 
        where: { 
          userId, 
          status: { in: ['PARTNER', 'NEGOTIATING'] } 
        } 
      }),
      
      // Employers
      prisma.employer.count({ where: { userId } }),
      prisma.employer.count({ 
        where: { 
          userId, 
          status: { in: ['ACTIVE', 'PREMIUM'] } 
        } 
      }),
      
      // Points
      prisma.activity.aggregate({
        where: { userId },
        _sum: { points: true }
      }),
      prisma.activity.aggregate({
        where: { 
          userId,
          createdAt: { gte: startOfMonth }
        },
        _sum: { points: true }
      }),
    ]);

    // Get activity breakdown by type
    const activityBreakdown = await prisma.activity.groupBy({
      by: ['type'],
      where: { userId },
      _count: { type: true },
      _sum: { points: true },
    });

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        points: true,
        createdAt: true,
      },
    });

    // Get top contacts by rating
    const topContacts = await prisma.contact.findMany({
      where: { 
        userId,
        rating: { gte: 2 }
      },
      orderBy: { rating: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employer: true,
        rating: true,
      },
    });

    // Calculate growth rates (simplified - comparing this month to last month)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonthActivities = await prisma.activity.count({
      where: {
        userId,
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
      },
    });

    const activityGrowth = lastMonthActivities > 0 
      ? ((monthActivities - lastMonthActivities) / lastMonthActivities) * 100 
      : monthActivities > 0 ? 100 : 0;

    return NextResponse.json({
      activities: {
        total: totalActivities,
        today: todayActivities,
        week: weekActivities,
        month: monthActivities,
        growth: Math.round(activityGrowth * 100) / 100,
        breakdown: activityBreakdown,
        recent: recentActivities,
      },
      contacts: {
        total: totalContacts,
        vip: vipContacts,
        top: topContacts,
      },
      businesses: {
        total: totalBusinesses,
        active: activeBusinesses,
      },
      employers: {
        total: totalEmployers,
        active: activeEmployers,
      },
      points: {
        total: totalPoints._sum.points || 0,
        month: monthPoints._sum.points || 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}); 