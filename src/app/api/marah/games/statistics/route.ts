import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const period = searchParams.get('period') || '30'; // days

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

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Parallel queries for better performance
    const [
      gameStats,
      totalGames,
      availableGames,
      totalOrders,
      totalRevenue,
      gameCategories,
      topPerformingGames,
      gameOrderStats,
      recentGameActivity,
    ] = await Promise.all([
      // Game statistics with order data
      prisma.marahGame.findMany({
        where: { companyId },
        include: {
          orderItems: {
            include: {
              order: {
                select: {
                  id: true,
                  status: true,
                  totalAmount: true,
                  orderDate: true,
                  customer: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            where: {
              order: {
                orderDate: { gte: startDate },
              },
            },
          },
        },
      }),

      // Total games count
      prisma.marahGame.count({
        where: { companyId },
      }),

      // Available games count
      prisma.marahGame.count({
        where: { 
          companyId,
          isAvailable: true,
        },
      }),

      // Total orders in period
      prisma.marahOrder.count({
        where: {
          companyId,
          orderDate: { gte: startDate },
        },
      }),

      // Total revenue in period
      prisma.marahOrder.aggregate({
        where: {
          companyId,
          orderDate: { gte: startDate },
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
      }),

      // Game categories distribution
      prisma.marahGame.groupBy({
        by: ['category'],
        where: { companyId },
        _count: { category: true },
      }),

      // Top performing games by revenue
      prisma.marahOrderItem.groupBy({
        by: ['gameId'],
        where: {
          order: {
            companyId,
            orderDate: { gte: startDate },
            status: 'COMPLETED',
          },
        },
        _sum: { totalPrice: true },
        _count: { gameId: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 10,
      }),

      // Game order statistics
      prisma.marahOrderItem.groupBy({
        by: ['gameId'],
        where: {
          order: {
            companyId,
            orderDate: { gte: startDate },
          },
        },
        _sum: { 
          quantity: true,
          totalPrice: true,
          days: true,
        },
        _count: { gameId: true },
        _avg: { days: true },
      }),

      // Recent game activity (last 7 days)
      prisma.marahOrderItem.findMany({
        where: {
          order: {
            companyId,
            orderDate: { 
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        include: {
          game: {
            select: {
              id: true,
              nameEn: true,
              nameAr: true,
              category: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              orderDate: true,
              customer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { order: { orderDate: 'desc' } },
        take: 20,
      }),
    ]);

    // Process game statistics
    const gamesWithStats = gameStats.map(game => {
      const orders = game.orderItems;
      const completedOrders = orders.filter(item => item.order.status === 'COMPLETED');
      const totalBookings = orders.length;
      const totalRevenue = completedOrders.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
      const totalQuantity = orders.reduce((sum, item) => sum + item.quantity, 0);
      const avgDays = orders.length > 0 ? orders.reduce((sum, item) => sum + item.days, 0) / orders.length : 0;
      const uniqueCustomers = new Set(orders.map(item => item.order.customer.id)).size;
      
      // Calculate utilization rate (bookings in period / total days in period)
      const utilizationRate = totalBookings > 0 ? Math.min((totalBookings / periodDays) * 100, 100) : 0;
      
      // Calculate average rating (mock for now, can be implemented with actual reviews)
      const avgRating = 4.0 + Math.random() * 1.0; // Mock rating between 4.0-5.0

      return {
        id: game.id,
        nameEn: game.nameEn,
        nameAr: game.nameAr,
        category: game.category,
        pricePerDay: Number(game.pricePerDay),
        isAvailable: game.isAvailable,
        totalBookings,
        totalRevenue,
        totalQuantity,
        avgDays: Math.round(avgDays * 10) / 10,
        uniqueCustomers,
        utilizationRate: Math.round(utilizationRate * 10) / 10,
        avgRating: Math.round(avgRating * 10) / 10,
        status: game.isAvailable ? 'active' : 'inactive',
      };
    });

    // Get game details for top performers
    const topGamesWithDetails = await Promise.all(
      topPerformingGames.map(async (stat) => {
        const game = await prisma.marahGame.findUnique({
          where: { id: stat.gameId },
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            category: true,
            pricePerDay: true,
          },
        });
        return {
          ...game,
          totalRevenue: Number(stat._sum.totalPrice) || 0,
          totalBookings: stat._count.gameId,
        };
      })
    );

    // Calculate overview metrics
    const overview = {
      totalGames,
      availableGames,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
      avgRevenuePerGame: gamesWithStats.length > 0 
        ? gamesWithStats.reduce((sum, game) => sum + game.totalRevenue, 0) / gamesWithStats.length 
        : 0,
      mostPopularCategory: gameCategories.length > 0 
        ? gameCategories.reduce((prev, current) => 
            prev._count.category > current._count.category ? prev : current
          ).category 
        : 'N/A',
      utilizationRate: gamesWithStats.length > 0 
        ? gamesWithStats.reduce((sum, game) => sum + game.utilizationRate, 0) / gamesWithStats.length 
        : 0,
      avgRating: gamesWithStats.length > 0 
        ? gamesWithStats.reduce((sum, game) => sum + game.avgRating, 0) / gamesWithStats.length 
        : 0,
    };

    // Process categories
    const categories = gameCategories.map(cat => ({
      name: cat.category,
      count: cat._count.category,
      percentage: totalGames > 0 ? (cat._count.category / totalGames) * 100 : 0,
    }));

    // Process recent activity
    const recentActivity = recentGameActivity.map(item => ({
      id: item.id,
      gameId: item.game.id,
      gameName: item.game.nameEn,
      gameCategory: item.game.category,
      orderNumber: item.order.orderNumber,
      customerName: item.order.customer.name,
      quantity: item.quantity,
      days: item.days,
      totalPrice: Number(item.totalPrice),
      orderDate: item.order.orderDate,
      status: item.order.status,
    }));

    return NextResponse.json({
      overview,
      games: gamesWithStats,
      categories,
      topPerformers: topGamesWithDetails,
      recentActivity,
      period: periodDays,
    });
  } catch (error) {
    console.error('Error fetching game statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch game statistics' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler); 