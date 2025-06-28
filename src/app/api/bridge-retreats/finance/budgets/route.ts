import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Map frontend category names to enum values
const mapCategoryToEnum = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'staff_salaries': 'STAFF_SALARIES',
    'marketing': 'MARKETING',
    'utilities': 'UTILITIES',
    'supplies': 'SUPPLIES',
    'maintenance': 'FACILITY_MAINTENANCE',
    'food_beverage': 'FOOD_BEVERAGE',
    'equipment': 'EQUIPMENT',
    'insurance': 'INSURANCE',
    'training': 'PROFESSIONAL_SERVICES',
    'travel': 'TRAVEL_TRANSPORT'
  };
  
  return categoryMap[category] || category.toUpperCase().replace(/\s+/g, '_');
};

// GET - Fetch budget comparison data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    // Fetch active budgets with their items
    const budgets = await prisma.retreatBudget.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        items: true
      }
    });

    // Fetch actual spending from budget items
    const budgetItems = await prisma.retreatBudgetItem.findMany({
      include: {
        budget: true
      }
    });

    // Create budget comparison data
    const budgetComparison = budgetItems.map(item => {
      const budgeted = Number(item.budgetedAmount);
      const actual = Number(item.actualAmount || 0);
      const variance = actual - budgeted;
      const variancePercent = budgeted > 0 ? (variance / budgeted) * 100 : 0;

      let status: 'OVER' | 'UNDER' | 'ON_TRACK' = 'ON_TRACK';
      if (Math.abs(variancePercent) > 10) {
        status = variancePercent > 0 ? 'OVER' : 'UNDER';
      }

      return {
        id: item.id,
        category: item.category,
        budgeted,
        actual,
        variance,
        variancePercent,
        status,
        description: item.description || '',
        period: item.budget.period || 'monthly'
      };
    });

    return NextResponse.json({
      success: true,
      budgetComparison
    });

  } catch (error) {
    console.error('Error fetching budget data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget data' },
      { status: 500 }
    );
  }
}

// POST - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Budget creation request body:', body);
    
    const { category, amount, description, period, companyId } = body;

    // Validate required fields
    if (!category || !amount || !period) {
      console.log('Validation failed:', { category, amount, period });
      return NextResponse.json(
        { error: 'Category, amount, and period are required' },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Amount must be a valid positive number' },
        { status: 400 }
      );
    }

    // Normalize category to uppercase with underscores
    const normalizedCategory = mapCategoryToEnum(category);
    console.log('Normalized category:', normalizedCategory);

    // Create budget
    const budget = await prisma.retreatBudget.create({
      data: {
        name: `${category} Budget`,
        totalBudget: numericAmount,
        period: period.toUpperCase(),
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }
    });

    console.log('Budget created:', budget);

    // Create budget item
    const budgetItem = await prisma.retreatBudgetItem.create({
      data: {
        budgetId: budget.id,
        category: normalizedCategory as any, // Cast to RetreatTransactionCategory enum
        budgetedAmount: numericAmount,
        actualAmount: 0,
        description: description || ''
      }
    });

    console.log('Budget item created:', budgetItem);

    // Create budget comparison object for frontend
    const budgetComparison = {
      id: budgetItem.id,
      category: budgetItem.category,
      budgeted: Number(budgetItem.budgetedAmount),
      actual: Number(budgetItem.actualAmount || 0),
      variance: Number(budgetItem.actualAmount || 0) - Number(budgetItem.budgetedAmount),
      variancePercent: -100, // New budget starts at -100% (no actual spending yet)
      status: 'UNDER' as const,
      description: budgetItem.description || '',
      period: budget.period.toLowerCase() || 'monthly'
    };

    console.log('Budget comparison object:', budgetComparison);

    return NextResponse.json({
      success: true,
      message: 'Budget created successfully',
      budget,
      budgetItem,
      budgetComparison
    });

  } catch (error) {
    console.error('Error creating budget:', error);
    
    // Check if it's a Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error code:', error.code);
      
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A budget with this category already exists' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create budget' },
      { status: 500 }
    );
  }
}

// PUT - Update budget actual amount
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { budgetId, actualAmount } = body;

    if (!budgetId || actualAmount === undefined) {
      return NextResponse.json(
        { error: 'Budget ID and actual amount are required' },
        { status: 400 }
      );
    }

    // Update budget item actual amount
    const updatedItem = await prisma.retreatBudgetItem.update({
      where: { id: budgetId },
      data: {
        actualAmount: Number(actualAmount)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Budget updated successfully',
      budgetItem: updatedItem
    });

  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a budget
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('budgetId');

    if (!budgetId) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    // Delete budget item (this will cascade to delete related budget if it's the only item)
    await prisma.retreatBudgetItem.delete({
      where: { id: budgetId }
    });

    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
} 