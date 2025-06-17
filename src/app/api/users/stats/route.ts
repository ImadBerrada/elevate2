import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';

// GET /api/users/stats - Get user statistics (Manager and above)
export const GET = withRole(['MANAGER', 'ADMIN', 'SUPER_ADMIN'])(async (request: AuthenticatedRequest) => {
  try {
    // Get total user count
    const total = await prisma.user.count();
    
    // Get users by role
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });
    
    // Get users created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });
    
    // Transform role stats and map to frontend roles
    const byRole: Record<string, number> = {};
    let admins = 0;
    let managers = 0;
    let users = 0;
    
    roleStats.forEach(stat => {
      // Map database roles to frontend display
      if (stat.role === 'SUPER_ADMIN') {
        byRole['SUPER_ADMIN'] = (byRole['SUPER_ADMIN'] || 0) + stat._count.id;
        admins += stat._count.id;
      } else if (stat.role === 'ADMIN') {
        byRole['ADMIN'] = (byRole['ADMIN'] || 0) + stat._count.id;
        admins += stat._count.id;
      } else if (stat.role === 'MANAGER') {
        byRole['MANAGER'] = (byRole['MANAGER'] || 0) + stat._count.id;
        managers += stat._count.id;
      } else if (stat.role === 'USER') {
        byRole['USER'] = stat._count.id;
        users += stat._count.id;
      }
    });
    
    // Since we don't have status field yet, we'll simulate active/inactive
    // For now, all users are considered active
    const active = total;
    const inactive = 0;
    const suspended = 0;
    
    // Simulate company stats (since we don't have company field yet)
    const byCompany: Record<string, number> = {
      'ELEVATE Investment Group': Math.floor(total * 0.4),
      'Real Estate Division': Math.floor(total * 0.3),
      'MARAH Delivery': Math.floor(total * 0.2),
      'ALBARQ Operations': Math.floor(total * 0.1),
    };
    
    const byStatus: Record<string, number> = {
      'ACTIVE': active,
      'INACTIVE': inactive,
      'SUSPENDED': suspended,
    };
    
    return NextResponse.json({
      total,
      active,
      inactive,
      suspended,
      admins,
      managers,
      users,
      newThisMonth,
      byRole,
      byStatus,
      byCompany,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}); 