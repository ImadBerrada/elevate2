import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

async function handler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
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

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Today's date for daily metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parallel queries for better performance
    const [
      totalRevenue,
      totalExpenses,
      todayOrders,
      totalOrders,
      completedOrders,
      cancelledOrders,
      activeCustomers,
      totalGames,
      availableGames,
      activeDrivers,
      ordersByStatus,
    ] = await Promise.all([
      // Total Revenue
      prisma.marahOrder.aggregate({
        where: {
          companyId,
          status: 'COMPLETED',
          orderDate: { gte: startDate },
        },
        _sum: { totalAmount: true },
      }),

      // Total Expenses
      prisma.marahExpense.aggregate({
        where: {
          companyId,
          date: { gte: startDate },
        },
        _sum: { amount: true },
      }),

      // Today's Orders
      prisma.marahOrder.count({
        where: {
          companyId,
          orderDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Total Orders
      prisma.marahOrder.count({
        where: {
          companyId,
          orderDate: { gte: startDate },
        },
      }),

      // Completed Orders
      prisma.marahOrder.count({
        where: {
          companyId,
          status: 'COMPLETED',
          orderDate: { gte: startDate },
        },
      }),

      // Cancelled Orders
      prisma.marahOrder.count({
        where: {
          companyId,
          status: 'CANCELLED',
          orderDate: { gte: startDate },
        },
      }),

      // Active Customers (customers with orders in period)
      prisma.marahCustomer.count({
        where: {
          companyId,
          orders: {
            some: {
              orderDate: { gte: startDate },
            },
          },
        },
      }),

      // Total Games
      prisma.marahGame.count({
        where: { companyId },
      }),

      // Available Games
      prisma.marahGame.count({
        where: { 
          companyId,
          isAvailable: true 
        },
      }),

      // Active Drivers
      prisma.marahDriver.count({
        where: { 
          companyId,
          status: 'ACTIVE' 
        },
      }),

      // Orders by Status
      prisma.marahOrder.groupBy({
        by: ['status'],
        where: {
          companyId,
          orderDate: { gte: startDate },
        },
        _count: { status: true },
      }),
    ]);

    // Calculate metrics
    const revenue = Number(totalRevenue._sum.totalAmount) || 0;
    const expenses = Number(totalExpenses._sum.amount) || 0;
    const profit = revenue - expenses;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
    const gameUtilizationRate = totalGames > 0 ? (availableGames / totalGames) * 100 : 0;

    // Format response
    const analytics = {
      overview: {
        totalRevenue: revenue,
        totalExpenses: expenses,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
        todayOrders,
        totalOrders,
        completedOrders,
        cancelledOrders,
        completionRate,
        cancellationRate,
        activeCustomers,
        totalGames,
        availableGames,
        gameUtilizationRate,
        activeDrivers,
      },
      charts: {
        revenueByDay: [],
        expensesByDay: [],
        ordersByStatus: ordersByStatus.map(item => ({
          status: item.status,
          count: item._count.status,
        })),
        monthlyStats: [],
      },
      insights: {
        topGames: [],
        topCustomers: [],
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export const GET = withAuth(handler); 