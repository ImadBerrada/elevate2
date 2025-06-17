import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const updateExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  category: z.enum(['FUEL', 'MAINTENANCE', 'MARKETING', 'SUPPLIES', 'UTILITIES', 'SALARIES', 'RENT', 'INSURANCE', 'OTHER']).optional(),
  date: z.string().transform(val => new Date(val)).optional(),
  receipt: z.string().optional(),
  notes: z.string().optional(),
});

async function getHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const { id } = await params;const expense = await prisma.marahExpense.findUnique({
      where: { id: id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (expense.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Convert Decimal to number for JSON serialization
    const expenseWithNumbers = {
      ...expense,
      amount: Number(expense.amount),
    };

    return NextResponse.json(expenseWithNumbers);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 });
  }
}

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const { id } = await params;const body = await request.json();
    const validatedData = updateExpenseSchema.parse(body);

    // Get the expense first to verify ownership
    const existingExpense = await prisma.marahExpense.findUnique({
      where: { id: id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingExpense.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the expense
    const updatedExpense = await prisma.marahExpense.update({
      where: { id: id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    // Convert Decimal to number for JSON serialization
    const expenseWithNumbers = {
      ...updatedExpense,
      amount: Number(updatedExpense.amount),
    };

    return NextResponse.json(expenseWithNumbers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const { id } = await params;// Get the expense first to verify ownership
    const existingExpense = await prisma.marahExpense.findUnique({
      where: { id: id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingExpense.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the expense
    await prisma.marahExpense.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler); 