import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/bridge-retreats/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get basic counts
    const [
      totalRetreats,
      activeRetreats,
      totalBookings,
      totalRevenue,
      totalGuests,
      averageRating,
    ] = await Promise.all([
      prisma.retreat.count(),
      prisma.retreat.count({ where: { status: 'ACTIVE' } }),
      prisma.retreatBooking.count(),
      prisma.retreatBooking.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'CONFIRMED' },
      }),
      prisma.retreatGuest.count(),
      prisma.retreatReview.aggregate({
        _avg: { rating: true },
      }),
    ]);

    // Get occupancy data
    const occupancyData = await prisma.retreat.findMany({
      select: {
        id: true,
        title: true,
        capacity: true,
        _count: {
          select: {
            bookings: {
              where: {
                status: 'CONFIRMED',
                checkInDate: { gte: startDate },
              },
            },
          },
        },
      },
    });

    const occupancyRate = occupancyData.reduce((acc, retreat) => {
      const occupancy = retreat.capacity > 0 ? (retreat._count.bookings / retreat.capacity) * 100 : 0;
      return acc + occupancy;
    }, 0) / (occupancyData.length || 1);

    // Get revenue by month for the last 6 months
    const revenueByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "checkInDate") as month,
        SUM("totalAmount") as revenue,
        COUNT(*) as bookings
      FROM "retreat_bookings" 
      WHERE "status" = 'CONFIRMED' 
        AND "checkInDate" >= ${new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)}
      GROUP BY DATE_TRUNC('month', "checkInDate")
      ORDER BY month ASC
    `;

    // Get retreat type distribution
    const retreatTypes = await prisma.retreat.groupBy({
      by: ['type'],
      _count: { type: true },
      _sum: { capacity: true },
    });

    // Get recent bookings
    const recentBookings = await prisma.retreatBooking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: true,
        retreat: {
          select: {
            title: true,
            type: true,
          },
        },
      },
    });

    // Get top performing retreats
    const topRetreats = await prisma.retreat.findMany({
      take: 5,
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
    });

    const topRetreatsWithStats = topRetreats.map(retreat => ({
      ...retreat,
      totalBookings: retreat._count.bookings,
      averageRating: retreat.reviews.length > 0 
        ? retreat.reviews.reduce((sum, review) => sum + review.rating, 0) / retreat.reviews.length 
        : 0,
    }));

    // Get guest satisfaction trends
    const satisfactionTrends = await prisma.retreatReview.groupBy({
      by: ['rating'],
      _count: { rating: true },
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Calculate key metrics
    const metrics = {
      totalRetreats,
      activeRetreats,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalGuests,
      averageRating: averageRating._avg.rating || 0,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
    };

    return NextResponse.json({
      metrics,
      revenueByMonth,
      retreatTypes,
      recentBookings,
      topRetreats: topRetreatsWithStats,
      satisfactionTrends,
      occupancyData: occupancyData.map(retreat => ({
        ...retreat,
        occupancyRate: retreat.capacity > 0 ? Math.round((retreat._count.bookings / retreat.capacity) * 100) : 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 