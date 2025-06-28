import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { startOfDay, endOfDay, subDays, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const category = searchParams.get('category') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const department = searchParams.get('department') || 'ALL';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (period) {
      case '7d':
        startDate = startOfDay(subDays(now, 7));
        break;
      case '30d':
        startDate = startOfDay(subDays(now, 30));
        break;
      case '90d':
        startDate = startOfDay(subDays(now, 90));
        break;
      case '1y':
        startDate = startOfDay(subDays(now, 365));
        break;
      default:
        startDate = startOfDay(subDays(now, 30));
    }

    // Fetch expense transactions
    const expenses = await prisma.retreatFinancialTransaction.findMany({
      where: {
        type: 'EXPENSE',
        transactionDate: {
          gte: startDate,
          lte: endDate
        },
        ...(category !== 'ALL' && {
          category: category as any
        }),
        ...(status !== 'ALL' && {
          status: status as any
        }),
        ...(department !== 'ALL' && {
          department: department as any
        })
      },
      include: {
        retreat: {
          select: {
            id: true,
            title: true,
            type: true,
            location: true
          }
        },
        facility: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true
          }
        },
        booking: {
          select: {
            id: true,
            guest: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        transactionDate: 'desc'
      }
    });

    // Calculate metrics
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const approvedExpenses = expenses
      .filter(e => e.status === 'APPROVED')
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    const pendingExpenses = expenses
      .filter(e => e.status === 'PENDING')
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    const rejectedExpenses = expenses
      .filter(e => e.status === 'REJECTED')
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    // Calculate previous period for growth comparison
    const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const previousPeriodEnd = startDate;

    const previousExpenses = await prisma.retreatFinancialTransaction.findMany({
      where: {
        type: 'EXPENSE',
        transactionDate: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    });

    const previousTotal = previousExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const growthRate = previousTotal > 0 ? ((totalExpenses - previousTotal) / previousTotal) * 100 : 0;

    // Expense breakdown by category
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      const cat = expense.category;
      if (!acc[cat]) {
        acc[cat] = {
          category: cat,
          amount: 0,
          count: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        };
      }
      acc[cat].amount += Number(expense.amount);
      acc[cat].count += 1;
      
      if (expense.status === 'APPROVED') acc[cat].approved += Number(expense.amount);
      else if (expense.status === 'PENDING') acc[cat].pending += Number(expense.amount);
      else if (expense.status === 'REJECTED') acc[cat].rejected += Number(expense.amount);
      
      return acc;
    }, {} as Record<string, any>);

    const categoryData = Object.values(categoryBreakdown).map((item: any) => ({
      ...item,
      percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
    }));

    // Department breakdown
    const departmentBreakdown = expenses.reduce((acc, expense) => {
      const dept = expense.department || 'UNASSIGNED';
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          amount: 0,
          count: 0
        };
      }
      acc[dept].amount += Number(expense.amount);
      acc[dept].count += 1;
      return acc;
    }, {} as Record<string, any>);

    const departmentData = Object.values(departmentBreakdown).map((item: any) => ({
      ...item,
      percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
    }));

    // Monthly trends
    const monthlyTrends = expenses.reduce((acc, expense) => {
      const monthKey = format(expense.transactionDate, 'MMM yyyy');
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          amount: 0,
          count: 0
        };
      }
      acc[monthKey].amount += Number(expense.amount);
      acc[monthKey].count += 1;
      return acc;
    }, {} as Record<string, any>);

    const trendsData = Object.values(monthlyTrends);

    // Transform expenses data
    const expensesData = expenses.map(expense => ({
      id: expense.id,
      category: expense.category,
      department: expense.department,
      amount: Number(expense.amount),
      description: expense.description,
      vendor: expense.vendorName || 'N/A',
      date: expense.transactionDate.toISOString(),
      status: expense.status,
      reference: expense.reference,
      paymentMethod: expense.paymentMethod,
      taxAmount: expense.taxAmount ? Number(expense.taxAmount) : 0,
      approvedBy: expense.approvedBy,
      approvedAt: expense.approvedAt?.toISOString(),
      retreat: expense.retreat ? {
        id: expense.retreat.id,
        title: expense.retreat.title,
        type: expense.retreat.type,
        location: expense.retreat.location
      } : null,
      facility: expense.facility ? {
        id: expense.facility.id,
        name: expense.facility.name,
        type: expense.facility.type,
        location: expense.facility.location
      } : null,
      booking: expense.booking ? {
        id: expense.booking.id,
        guestName: `${expense.booking.guest.firstName} ${expense.booking.guest.lastName}`
      } : null,
      tags: expense.tags,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    }));

    const metrics = {
      totalExpenses,
      approvedExpenses,
      pendingExpenses,
      rejectedExpenses,
      totalCount: expenses.length,
      averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
      growthRate
    };

    return NextResponse.json({
      metrics,
      expenses: expensesData,
      categoryBreakdown: categoryData,
      departmentBreakdown: departmentData,
      monthlyTrends: trendsData,
      period,
      dateRange: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
      }
    });

  } catch (error) {
    console.error('Error fetching expenses data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category,
      department,
      amount,
      description,
      vendorName,
      paymentMethod,
      reference,
      taxAmount,
      retreatId,
      facilityId,
      bookingId,
      tags
    } = body;

    // Validate required fields
    if (!category || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: category, amount, description' },
        { status: 400 }
      );
    }

    // Create new expense transaction
    const expense = await prisma.retreatFinancialTransaction.create({
      data: {
        type: 'EXPENSE',
        category: category,
        department: department || null,
        amount: parseFloat(amount),
        description,
        vendorName: vendorName || null,
        paymentMethod: paymentMethod || null,
        reference: reference || null,
        taxAmount: taxAmount ? parseFloat(taxAmount) : null,
        retreatId: retreatId || null,
        facilityId: facilityId || null,
        bookingId: bookingId || null,
        tags: tags || [],
        status: 'PENDING'
      },
      include: {
        retreat: {
          select: {
            id: true,
            title: true,
            type: true,
            location: true
          }
        },
        facility: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true
          }
        },
        booking: {
          select: {
            id: true,
            guest: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Transform response data
    const responseData = {
      id: expense.id,
      category: expense.category,
      department: expense.department,
      amount: Number(expense.amount),
      description: expense.description,
      vendor: expense.vendorName || 'N/A',
      date: expense.transactionDate.toISOString(),
      status: expense.status,
      reference: expense.reference,
      paymentMethod: expense.paymentMethod,
      taxAmount: expense.taxAmount ? Number(expense.taxAmount) : 0,
      retreat: expense.retreat,
      facility: expense.facility,
      booking: expense.booking ? {
        id: expense.booking.id,
        guestName: `${expense.booking.guest.firstName} ${expense.booking.guest.lastName}`
      } : null,
      tags: expense.tags,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedBy } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    // Update expense status
    const expense = await prisma.retreatFinancialTransaction.update({
      where: { id },
      data: {
        status: status,
        approvedBy: status === 'APPROVED' ? approvedBy : null,
        approvedAt: status === 'APPROVED' ? new Date() : null
      },
      include: {
        retreat: {
          select: {
            id: true,
            title: true,
            type: true,
            location: true
          }
        },
        facility: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true
          }
        }
      }
    });

    return NextResponse.json({
      id: expense.id,
      status: expense.status,
      approvedBy: expense.approvedBy,
      approvedAt: expense.approvedAt?.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
} 