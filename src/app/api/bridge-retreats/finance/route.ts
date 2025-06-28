import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '12m':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subDays(now, 30);
    }

    // Get financial transactions for the period
    const transactions = await prisma.retreatFinancialTransaction.findMany({
      where: {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        booking: {
          include: {
            retreat: true,
            guest: true,
          },
        },
        facility: true,
        retreat: true,
      },
    });

    // Get all bookings for revenue calculation
    const bookings = await prisma.retreatBooking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        retreat: true,
        guest: true,
      },
    });

    // Calculate key metrics
    const totalRevenue = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calculate accounts receivable (unpaid bookings)
    const accountsReceivable = bookings
      .filter(b => b.paymentStatus !== 'PAID')
      .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

    // Calculate accounts payable (pending expense transactions)
    const accountsPayable = transactions
      .filter(t => t.type === 'EXPENSE' && t.status === 'PENDING')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Calculate operating expenses
    const operatingExpenses = transactions
      .filter(t => t.type === 'EXPENSE' && [
        'STAFF_SALARIES', 'UTILITIES', 'FACILITY_MAINTENANCE', 'SUPPLIES'
      ].includes(t.category))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Calculate growth rates (compare with previous period)
    const previousStartDate = period === '12m' 
      ? subMonths(startDate, 12) 
      : subDays(startDate, Math.abs(startDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const previousTransactions = await prisma.retreatFinancialTransaction.findMany({
      where: {
        transactionDate: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    });

    const previousRevenue = previousTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const previousExpenses = previousTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const expenseGrowth = previousExpenses > 0 
      ? ((totalExpenses - previousExpenses) / previousExpenses) * 100 
      : 0;

    // Calculate cash flow
    const cashFlow = netProfit;

    const metrics = {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      cashFlow,
      accountsReceivable,
      accountsPayable,
      operatingExpenses,
      revenueGrowth,
      expenseGrowth,
    };

    // Generate budget comparison data
    const currentBudget = await prisma.retreatBudget.findFirst({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        items: true,
      },
    });

    const budgetComparison = currentBudget?.items.map(item => {
      const actualAmount = transactions
        .filter(t => t.category === item.category)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const variance = actualAmount - Number(item.budgetedAmount);
      const variancePercent = Number(item.budgetedAmount) > 0 
        ? (variance / Number(item.budgetedAmount)) * 100 
        : 0;

      let status: 'OVER' | 'UNDER' | 'ON_TRACK' = 'ON_TRACK';
      if (Math.abs(variancePercent) > 10) {
        status = variancePercent > 0 ? 'OVER' : 'UNDER';
      }

      return {
        category: item.category,
        budgeted: Number(item.budgetedAmount),
        actual: actualAmount,
        variance,
        variancePercent,
        status,
      };
    }) || [];

    // Generate cash flow data (monthly for last 6 months)
    const cashFlowData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      
      const monthTransactions = await prisma.retreatFinancialTransaction.findMany({
        where: {
          transactionDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const cashIn = monthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const cashOut = monthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const netCashFlow = cashIn - cashOut;
      
      // Calculate running balance (simplified)
      const previousBalance: number = i === 5 ? 100000 : cashFlowData[5-i-1]?.runningBalance || 100000;
      const runningBalance: number = previousBalance + netCashFlow;

      cashFlowData.push({
        month: format(monthStart, 'MMM'),
        cashIn,
        cashOut,
        netCashFlow,
        runningBalance,
      });
    }

    // Generate profit & loss data by retreat type
    const retreats = await prisma.retreat.findMany({
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        financialTransactions: {
          where: {
            transactionDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const profitLossData = Object.values(
      retreats.reduce((acc: any, retreat) => {
        const typeKey = `${retreat.type} Retreats`;
        
        if (!acc[typeKey]) {
          acc[typeKey] = {
            category: typeKey,
            revenue: 0,
            expenses: 0,
            profit: 0,
            margin: 0,
          };
        }

        const revenue = retreat.bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
        const expenses = retreat.financialTransactions
          .filter(t => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        acc[typeKey].revenue += revenue;
        acc[typeKey].expenses += expenses;
        acc[typeKey].profit = acc[typeKey].revenue - acc[typeKey].expenses;
        acc[typeKey].margin = acc[typeKey].revenue > 0 
          ? (acc[typeKey].profit / acc[typeKey].revenue) * 100 
          : 0;

        return acc;
      }, {})
    );

    // Generate financial alerts
    const alerts = [];

    // Budget variance alerts
    budgetComparison.forEach(item => {
      if (item.status === 'OVER' && Math.abs(item.variancePercent) > 15) {
        alerts.push({
          id: `budget-${item.category}`,
          type: 'WARNING' as const,
          title: 'Budget Variance Alert',
          description: `${item.category} expenses exceeded budget by ${item.variancePercent.toFixed(1)}%`,
          amount: item.variance,
          date: format(now, 'yyyy-MM-dd'),
        });
      }
    });

    // Cash flow alerts
    if (cashFlow < 10000) {
      alerts.push({
        id: 'cashflow-low',
        type: 'CRITICAL' as const,
        title: 'Low Cash Flow Warning',
        description: 'Current cash flow is below recommended threshold',
        amount: cashFlow,
        date: format(now, 'yyyy-MM-dd'),
      });
    }

    // Revenue target alerts
    if (revenueGrowth > 5) {
      alerts.push({
        id: 'revenue-target',
        type: 'INFO' as const,
        title: 'Revenue Target Exceeded',
        description: `Revenue growth of ${revenueGrowth.toFixed(1)}% exceeds target`,
        amount: totalRevenue,
        date: format(now, 'yyyy-MM-dd'),
      });
    }

    return NextResponse.json({
      metrics,
      budgetComparison,
      cashFlowData,
      profitLossData,
      alerts,
      period,
      dateRange: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
      },
    });

  } catch (error) {
    console.error('Error fetching financial data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, category, amount, description, bookingId, facilityId, retreatId, department } = body;

    if (!type || !category || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transaction = await prisma.retreatFinancialTransaction.create({
      data: {
        type,
        category,
        amount,
        description,
        bookingId: bookingId || null,
        facilityId: facilityId || null,
        retreatId: retreatId || null,
        department: department || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json(transaction, { status: 201 });

  } catch (error) {
    console.error('Error creating financial transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 