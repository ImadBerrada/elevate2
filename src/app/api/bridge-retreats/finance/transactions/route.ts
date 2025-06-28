import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { format, subDays } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const type = searchParams.get('type'); // 'INCOME', 'EXPENSE', or null for all
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
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
      default:
        startDate = subDays(now, 30);
    }

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    // Fetch financial transactions
    const transactions = await prisma.retreatFinancialTransaction.findMany({
      where,
      include: {
        retreat: {
          select: {
            id: true,
            title: true,
            type: true
          }
        },
        booking: {
          include: {
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        facility: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.retreatFinancialTransaction.count({
      where
    });

    // Transform transactions for frontend
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      category: transaction.category,
      amount: Number(transaction.amount),
      description: transaction.description || '',
      date: format(transaction.createdAt, 'yyyy-MM-dd'),
      status: transaction.status,
      retreat: transaction.retreat ? {
        id: transaction.retreat.id,
        title: transaction.retreat.title,
        type: transaction.retreat.type
      } : null,
      guest: transaction.booking?.guest ? {
        id: transaction.booking.guest.id,
        name: `${transaction.booking.guest.firstName} ${transaction.booking.guest.lastName}`,
        email: transaction.booking.guest.email
      } : null,
      facility: transaction.facility ? {
        id: transaction.facility.id,
        name: transaction.facility.name,
        type: transaction.facility.type
      } : null,
      bookingId: transaction.bookingId,
      reference: transaction.reference || transaction.id
    }));

    // Calculate summary statistics
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netAmount = totalIncome - totalExpenses;

    // Group by category for breakdown
    const categoryBreakdown = transactions.reduce((acc: any, transaction) => {
      const cat = transaction.category;
      if (!acc[cat]) {
        acc[cat] = {
          category: cat,
          income: 0,
          expenses: 0,
          count: 0
        };
      }
      
      if (transaction.type === 'INCOME') {
        acc[cat].income += Number(transaction.amount);
      } else {
        acc[cat].expenses += Number(transaction.amount);
      }
      acc[cat].count++;
      
      return acc;
    }, {});

    return NextResponse.json({
      transactions: transformedTransactions,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      summary: {
        totalIncome,
        totalExpenses,
        netAmount,
        transactionCount: transactions.length
      },
      categoryBreakdown: Object.values(categoryBreakdown),
      period,
      dateRange: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(now, 'yyyy-MM-dd')
      }
    });

  } catch (error) {
    console.error('Error fetching financial transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      category,
      amount,
      description,
      retreatId,
      bookingId,
      facilityId,
      reference,
      status = 'COMPLETED'
    } = body;

    // Validate required fields
    if (!type || !category || !amount) {
      return NextResponse.json(
        { error: 'Type, category, and amount are required' },
        { status: 400 }
      );
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either INCOME or EXPENSE' },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await prisma.retreatFinancialTransaction.create({
      data: {
        type,
        category,
        amount: Number(amount),
        description: description || null,
        retreatId: retreatId || null,
        bookingId: bookingId || null,
        facilityId: facilityId || null,
        reference: reference || null,
        status
      },
      include: {
        retreat: true,
        booking: {
          include: {
            guest: true
          }
        },
        facility: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction created successfully',
      transaction: {
        id: transaction.id,
        type: transaction.type,
        category: transaction.category,
        amount: Number(transaction.amount),
        description: transaction.description,
        date: format(transaction.createdAt, 'yyyy-MM-dd'),
        status: transaction.status,
        reference: transaction.reference
      }
    });

  } catch (error) {
    console.error('Error creating financial transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, category, amount, description, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Update transaction
    const updatedTransaction = await prisma.retreatFinancialTransaction.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(category && { category }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(description !== undefined && { description }),
        ...(status && { status })
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: {
        id: updatedTransaction.id,
        type: updatedTransaction.type,
        category: updatedTransaction.category,
        amount: Number(updatedTransaction.amount),
        description: updatedTransaction.description,
        status: updatedTransaction.status
      }
    });

  } catch (error) {
    console.error('Error updating financial transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    await prisma.retreatFinancialTransaction.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting financial transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
} 