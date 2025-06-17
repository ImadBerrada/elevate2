import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET - Real Estate Dashboard Analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId'); // Filter by specific owner if provided

    // Build base where clause for owner filtering
    const ownerFilter = ownerId ? { ownerId } : {};

    // Get current date ranges
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfYear = new Date(currentYear, 0, 1);
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0);

    // 1. Portfolio Overview
    const [
      totalProperties,
      totalUnits,
      occupiedUnits,
      totalTenants,
      activeTenants
    ] = await Promise.all([
      // Total Properties
      prisma.property.count({
        where: { ...ownerFilter, status: 'ACTIVE' }
      }),

      // Total Rental Units
      prisma.propertyRentalUnit.count({
        where: {
          property: ownerFilter
        }
      }),

      // Occupied Units
      prisma.propertyRentalUnit.count({
        where: {
          property: ownerFilter,
          status: 'OCCUPIED'
        }
      }),

      // Total Tenants
      prisma.tenant.count(),

      // Active Tenants
      prisma.tenant.count({
        where: { status: 'ACTIVE' }
      })
    ]);

    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    // 2. Financial Overview
    const [
      totalPropertyValue,
      monthlyRentIncome,
      lastMonthRentIncome,
      yearlyExpenses,
      monthlyExpenses,
      expectedFinancials
    ] = await Promise.all([
      // Total Property Value
      prisma.property.aggregate({
        where: { ...ownerFilter, status: 'ACTIVE' },
        _sum: { purchaseValue: true }
      }),

      // Current Month Rent Income (Actual)
      prisma.tenantPayment.aggregate({
        where: {
          paymentDate: { gte: startOfMonth },
          status: 'COMPLETED',
          agreement: {
            property: ownerFilter
          }
        },
        _sum: { amount: true }
      }),

      // Last Month Rent Income (Actual)
      prisma.tenantPayment.aggregate({
        where: {
          paymentDate: { 
            gte: startOfLastMonth,
            lte: endOfLastMonth
          },
          status: 'COMPLETED',
          agreement: {
            property: ownerFilter
          }
        },
        _sum: { amount: true }
      }),

      // Yearly Expenses (Actual)
      prisma.propertyExpense.aggregate({
        where: {
          expenseDate: { gte: startOfYear },
          property: ownerFilter
        },
        _sum: { amount: true }
      }),

      // Monthly Expenses (Actual)
      prisma.propertyExpense.aggregate({
        where: {
          expenseDate: { gte: startOfMonth },
          property: ownerFilter
        },
        _sum: { amount: true }
      }),

      // Expected Financial Data from Properties
      prisma.property.aggregate({
        where: { ...ownerFilter, status: 'ACTIVE' },
        _sum: { 
          expectedMonthlyRent: true,
          expectedAnnualExpenses: true,
          totalUnits: true,
          occupiedUnits: true
        }
      })
    ]);

    // Calculate income growth
    const currentIncome = monthlyRentIncome._sum.amount?.toNumber() || 0;
    const lastIncome = lastMonthRentIncome._sum.amount?.toNumber() || 0;
    const incomeGrowth = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;

    // 3. Recent Activities
    const [recentPayments, recentExpenses, pendingInvoices] = await Promise.all([
      // Recent Payments
      prisma.tenantPayment.findMany({
        where: {
          agreement: {
            property: ownerFilter
          }
        },
        include: {
          agreement: {
            include: {
              tenant: true,
              property: { select: { name: true } },
              rentalUnit: { select: { unitNumber: true } }
            }
          },
          paymentMethod: true
        },
        orderBy: { paymentDate: 'desc' },
        take: 5
      }),

      // Recent Expenses
      prisma.propertyExpense.findMany({
        where: {
          property: ownerFilter
        },
        include: {
          property: { select: { name: true } }
        },
        orderBy: { expenseDate: 'desc' },
        take: 5
      }),

      // Pending Invoices
      prisma.realEstateInvoice.findMany({
        where: {
          status: 'PENDING',
          agreement: {
            property: ownerFilter
          }
        },
        include: {
          agreement: {
            include: {
              tenant: true,
              property: { select: { name: true } },
              rentalUnit: { select: { unitNumber: true } }
            }
          }
        },
        orderBy: { dueDate: 'asc' },
        take: 10
      })
    ]);

    // 4. Property Performance
    const propertyPerformance = await prisma.property.findMany({
      where: { ...ownerFilter, status: 'ACTIVE' },
      include: {
        propertyType: true,
        rentalUnits: {
          include: {
            agreements: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    });

    const enrichedProperties = await Promise.all(
      propertyPerformance.map(async (property) => {
        // Calculate actual monthly income for this property (from payments)
        const actualMonthlyIncome = await prisma.tenantPayment.aggregate({
          where: {
            paymentDate: { gte: startOfMonth },
            status: 'COMPLETED',
            agreement: { propertyId: property.id }
          },
          _sum: { amount: true }
        });

        // Calculate expected monthly income from occupied units
        const occupiedUnitsWithRent = property.rentalUnits.filter(unit => 
          unit.agreements.some(agreement => agreement.status === 'ACTIVE')
        );
        
        const expectedMonthlyIncome = occupiedUnitsWithRent.reduce((total, unit) => {
          return total + (unit.rentAmount?.toNumber() || 0);
        }, 0);

        // Calculate yearly expenses for this property
        const yearlyExpenses = await prisma.propertyExpense.aggregate({
          where: {
            propertyId: property.id,
            expenseDate: { gte: startOfYear }
          },
          _sum: { amount: true }
        });

        const occupiedUnits = occupiedUnitsWithRent.length;

        const occupancyRate = property.rentalUnits.length > 0 
          ? (occupiedUnits / property.rentalUnits.length) * 100 
          : 0;

        // Use actual income if available, otherwise use expected income
        const displayMonthlyIncome = (actualMonthlyIncome._sum.amount?.toNumber() || 0) > 0 
          ? (actualMonthlyIncome._sum.amount?.toNumber() || 0)
          : expectedMonthlyIncome;

        const monthlyExpenses = (yearlyExpenses._sum.amount?.toNumber() || 0) / 12;

        return {
          id: property.id,
          name: property.name,
          type: property.propertyType.name,
          totalUnits: property.rentalUnits.length,
          occupiedUnits,
          occupancyRate,
          monthlyIncome: displayMonthlyIncome,
          yearlyExpenses: yearlyExpenses._sum.amount?.toNumber() || 0,
          netIncome: displayMonthlyIncome - monthlyExpenses
        };
      })
    );

    // 5. Monthly Income Trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const nextDate = new Date(currentYear, currentMonth - i + 1, 1);
      
      const monthlyIncome = await prisma.tenantPayment.aggregate({
        where: {
          paymentDate: { 
            gte: date,
            lt: nextDate
          },
          status: 'COMPLETED',
          agreement: {
            property: ownerFilter
          }
        },
        _sum: { amount: true }
      });

      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: monthlyIncome._sum.amount?.toNumber() || 0
      });
    }

    // 6. Expense Categories Breakdown
    const expenseCategories = await prisma.propertyExpense.groupBy({
      by: ['category'],
      where: {
        expenseDate: { gte: startOfYear },
        property: ownerFilter
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } }
    });

    // Calculate expected monthly rent from occupied units
    const allOccupiedUnits = await prisma.propertyRentalUnit.findMany({
      where: {
        property: ownerFilter,
        status: 'OCCUPIED'
      }
    });
    
    const expectedMonthlyRentFromUnits = allOccupiedUnits.reduce((total, unit) => {
      return total + (unit.rentAmount?.toNumber() || 0);
    }, 0);

    // Calculate expected values
    const expectedMonthlyRent = expectedFinancials._sum.expectedMonthlyRent?.toNumber() || expectedMonthlyRentFromUnits;
    const expectedAnnualExpenses = expectedFinancials._sum.expectedAnnualExpenses?.toNumber() || 0;
    const expectedMonthlyExpenses = expectedAnnualExpenses / 12;
    const expectedNetMonthly = expectedMonthlyRent - expectedMonthlyExpenses;
    
    // Use expected values if actual values are zero (for new properties)
    const displayMonthlyRent = currentIncome > 0 ? currentIncome : expectedMonthlyRent;
    const displayMonthlyExpenses = (monthlyExpenses._sum.amount?.toNumber() || 0) > 0 
      ? (monthlyExpenses._sum.amount?.toNumber() || 0) 
      : expectedMonthlyExpenses;
    const displayAnnualExpenses = (yearlyExpenses._sum.amount?.toNumber() || 0) > 0
      ? (yearlyExpenses._sum.amount?.toNumber() || 0)
      : expectedAnnualExpenses;

    const response = {
      portfolio: {
        totalProperties,
        totalUnits: totalUnits > 0 ? totalUnits : (expectedFinancials._sum.totalUnits || 0),
        occupiedUnits: occupiedUnits > 0 ? occupiedUnits : (expectedFinancials._sum.occupiedUnits || 0),
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        totalTenants,
        activeTenants
      },
      financial: {
        totalPropertyValue: totalPropertyValue._sum.purchaseValue?.toNumber() || 0,
        monthlyRentIncome: displayMonthlyRent,
        incomeGrowth: Math.round(incomeGrowth * 100) / 100,
        yearlyExpenses: displayAnnualExpenses,
        monthlyExpenses: displayMonthlyExpenses,
        netIncome: displayMonthlyRent - displayMonthlyExpenses,
        // Also include expected values separately
        expected: {
          monthlyRent: expectedMonthlyRent,
          annualExpenses: expectedAnnualExpenses,
          netMonthly: expectedNetMonthly
        },
        // And actual values separately
        actual: {
          monthlyRent: currentIncome,
          annualExpenses: yearlyExpenses._sum.amount?.toNumber() || 0,
          monthlyExpenses: monthlyExpenses._sum.amount?.toNumber() || 0
        }
      },
      recentActivities: {
        payments: recentPayments,
        expenses: recentExpenses,
        pendingInvoices
      },
      propertyPerformance: enrichedProperties,
      monthlyTrend,
      expenseCategories: expenseCategories.map(cat => ({
        category: cat.category,
        amount: cat._sum.amount?.toNumber() || 0
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 