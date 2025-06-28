import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { subDays, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const companyId = searchParams.get('companyId');

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate = now;

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
      case '1y':
        startDate = subDays(now, 365);
        break;
      case 'mtd':
        startDate = startOfMonth(now);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = subDays(now, 30);
    }

    // Get bookings with retreat information for the period
    const bookings = await prisma.retreatBooking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        retreat: true,
        guest: true
      }
    });

    // Get budget items for the period
    const budgetItems = await prisma.retreatBudgetItem.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        budget: true
      }
    });

    // Get financial transactions for the period
    const transactions = await prisma.retreatFinancialTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        retreat: true,
        booking: {
          include: {
            retreat: true
          }
        }
      }
    });

    // Calculate metrics
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + Number(booking.paidAmount || 0);
    }, 0);

    const totalExpenses = budgetItems.reduce((sum, item) => {
      return sum + Number(item.actualAmount || 0);
    }, 0);

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calculate cash flow (revenue - expenses)
    const cashFlow = netProfit;

    // Calculate accounts receivable (unpaid bookings)
    const accountsReceivable = bookings.reduce((sum, booking) => {
      const unpaid = Number(booking.totalAmount) - Number(booking.paidAmount || 0);
      return sum + (unpaid > 0 ? unpaid : 0);
    }, 0);

    // Calculate accounts payable (pending expenses)
    const accountsPayable = budgetItems.reduce((sum, item) => {
      const pending = Number(item.budgetedAmount) - Number(item.actualAmount || 0);
      return sum + (pending > 0 ? pending : 0);
    }, 0);

    // Calculate operating expenses (subset of total expenses)
    const operatingExpenses = budgetItems
      .filter(item => ['OPERATIONS', 'STAFF', 'MARKETING'].includes(item.category))
      .reduce((sum, item) => sum + Number(item.actualAmount || 0), 0);

    // Calculate growth rates (compare with previous period)
    const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const previousPeriodEnd = startDate;

    const previousBookings = await prisma.retreatBooking.findMany({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    });

    const previousBudgetItems = await prisma.retreatBudgetItem.findMany({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    });

    const previousRevenue = previousBookings.reduce((sum, booking) => sum + Number(booking.paidAmount || 0), 0);
    const previousExpenses = previousBudgetItems.reduce((sum, item) => sum + Number(item.actualAmount || 0), 0);

    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const expenseGrowth = previousExpenses > 0 ? ((totalExpenses - previousExpenses) / previousExpenses) * 100 : 0;

    // Generate cash flow data by month
    const cashFlowData = [];
    const monthsToShow = period === '1y' ? 12 : period === '90d' ? 3 : 6; // Show 6 months by default
    let runningBalance = 100000; // Starting balance (this could be stored in settings)
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      
      // Get bookings with payments in this month
      const monthBookings = await prisma.retreatBooking.findMany({
        where: {
          OR: [
            {
              createdAt: {
                gte: monthStart,
                lte: monthEnd
              },
              paidAmount: {
                gt: 0
              }
            },
            {
              updatedAt: {
                gte: monthStart,
                lte: monthEnd
              },
              paidAmount: {
                gt: 0
              }
            }
          ]
        }
      });
      
      // Get financial transactions for this month
      const monthTransactions = await prisma.retreatFinancialTransaction.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });
      
      // Calculate cash inflow from bookings and income transactions
      const bookingCashIn = monthBookings.reduce((sum, b) => sum + Number(b.paidAmount || 0), 0);
      const transactionCashIn = monthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const cashIn = bookingCashIn + transactionCashIn;
      
      // Calculate cash outflow from expense transactions and budget items
      const transactionCashOut = monthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Get budget items that had actual spending in this month
      const monthBudgetExpenses = await prisma.retreatBudgetItem.findMany({
        where: {
          updatedAt: {
            gte: monthStart,
            lte: monthEnd
          },
          actualAmount: {
            gt: 0
          }
        }
      });
      
      const budgetCashOut = monthBudgetExpenses.reduce((sum, item) => {
        // Only count the amount that was actually spent this month
        // This is simplified - in a real system you'd track when expenses occurred
        return sum + Number(item.actualAmount || 0);
      }, 0);
      
      const cashOut = transactionCashOut + budgetCashOut;
      const netCashFlow = cashIn - cashOut;
      runningBalance += netCashFlow;
      
      cashFlowData.push({
        month: format(monthStart, 'MMM yyyy'),
        cashIn,
        cashOut,
        netCashFlow,
        runningBalance
      });
    }
    
    // Reverse to show chronologically (oldest to newest)
    cashFlowData.reverse();

    // Generate profit/loss data by retreat type
    const retreatTypes = ['WELLNESS', 'CORPORATE', 'SPIRITUAL', 'ADVENTURE', 'EDUCATIONAL'];
    const profitLossData = [];
    
    for (const type of retreatTypes) {
      // Get bookings for this retreat type
      const typeBookings = bookings.filter(b => b.retreat?.type === type);
      const typeRevenue = typeBookings.reduce((sum, b) => sum + Number(b.paidAmount || 0), 0);
      
      // Get expenses from transactions related to this retreat type
      const typeTransactionExpenses = transactions
        .filter(t => t.type === 'EXPENSE' && (
          t.retreat?.type === type || 
          (t.booking?.retreat?.type === type)
        ))
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Get expenses from budget items (proportionally allocated)
      const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.paidAmount || 0), 0);
      const typeRevenueRatio = totalRevenue > 0 ? typeRevenue / totalRevenue : 0;
      const typeBudgetExpenses = budgetItems.reduce((sum, item) => {
        return sum + (Number(item.actualAmount || 0) * typeRevenueRatio);
      }, 0);
      
      const typeExpenses = typeTransactionExpenses + typeBudgetExpenses;
      const typeProfit = typeRevenue - typeExpenses;
      const typeMargin = typeRevenue > 0 ? (typeProfit / typeRevenue) * 100 : 0;
      
      // Only include types with data
      if (typeRevenue > 0 || typeExpenses > 0) {
        profitLossData.push({
          category: type,
          revenue: typeRevenue,
          expenses: typeExpenses,
          profit: typeProfit,
          margin: typeMargin
        });
      }
    }
    
    // Also add category-based profit/loss (by expense categories)
    const expenseCategories = [
      'STAFF_SALARIES',
      'FACILITY_MAINTENANCE',
      'UTILITIES',
      'MARKETING',
      'SUPPLIES',
      'FOOD_BEVERAGE',
      'EQUIPMENT',
      'INSURANCE'
    ];
    
    for (const category of expenseCategories) {
      // Get expenses for this category
      const categoryExpenses = transactions
        .filter(t => t.type === 'EXPENSE' && t.category === category)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Get budget expenses for this category
      const categoryBudgetExpenses = budgetItems
        .filter(item => item.category === category)
        .reduce((sum, item) => sum + Number(item.actualAmount || 0), 0);
      
      const totalCategoryExpenses = categoryExpenses + categoryBudgetExpenses;
      
      // Calculate revenue attribution (simplified - could be more sophisticated)
      const attributedRevenue = totalRevenue * 0.1; // 10% revenue attribution per major category
      const categoryProfit = attributedRevenue - totalCategoryExpenses;
      const categoryMargin = attributedRevenue > 0 ? (categoryProfit / attributedRevenue) * 100 : 0;
      
      if (totalCategoryExpenses > 0) {
        profitLossData.push({
          category: category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          revenue: attributedRevenue,
          expenses: totalCategoryExpenses,
          profit: categoryProfit,
          margin: categoryMargin
        });
      }
    }

    // Generate financial alerts
    const alerts = [];
    
    // Low cash flow alert
    if (cashFlow < 10000) {
      alerts.push({
        id: 'low-cash-flow',
        type: 'WARNING' as const,
        title: 'Low Cash Flow',
        description: 'Cash flow is below recommended threshold',
        amount: cashFlow,
        date: format(now, 'yyyy-MM-dd')
      });
    }

    // High accounts receivable alert
    if (accountsReceivable > 50000) {
      alerts.push({
        id: 'high-receivables',
        type: 'CRITICAL' as const,
        title: 'High Accounts Receivable',
        description: 'Outstanding payments are accumulating',
        amount: accountsReceivable,
        date: format(now, 'yyyy-MM-dd')
      });
    }

    // Expense over budget alert
    const overBudgetItems = budgetItems.filter(item => 
      (item.actualAmount || 0) > item.budgetedAmount
    );
    
    if (overBudgetItems.length > 0) {
      alerts.push({
        id: 'over-budget',
        type: 'WARNING' as const,
        title: 'Over Budget Items',
        description: `${overBudgetItems.length} budget categories are over limit`,
        date: format(now, 'yyyy-MM-dd')
      });
    }

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
      expenseGrowth
    };

    return NextResponse.json({
      metrics,
      cashFlowData,
      profitLossData,
      alerts,
      period,
      dateRange: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
      }
    });

  } catch (error) {
    console.error('Error fetching financial dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial dashboard data' },
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