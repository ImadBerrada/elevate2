import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET - Get specific report data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;
const reportId = id;
    const now = new Date();

    // Get base data for all reports
    const [
      totalProperties,
      totalUnits,
      occupiedUnits,
      totalTenants,
      activeTenants,
      totalInvoices,
      paidInvoices
    ] = await Promise.all([
      prisma.property.count(),
      prisma.propertyRentalUnit.count(),
      prisma.propertyRentalUnit.count({ where: { status: 'OCCUPIED' } }),
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.realEstateInvoice.count(),
      prisma.realEstateInvoice.count({ where: { status: 'PAID' } })
    ]);

    // Generate specific report based on ID
    let reportData = {};

    switch (reportId) {
      case 'RPT-001': // Monthly Financial Summary
        const revenueData = await prisma.realEstateInvoice.findMany({
          where: { status: 'PAID' },
          select: { totalAmount: true, createdAt: true }
        });

        const expenseData = await prisma.propertyExpense.findMany({
          select: { amount: true, expenseDate: true, category: true }
        });

        const totalRevenue = revenueData.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
        const totalExpenses = expenseData.reduce((sum, expense) => sum + Number(expense.amount), 0);

        reportData = {
          id: reportId,
          title: "Monthly Financial Summary",
          generatedDate: now.toISOString(),
          period: "Monthly",
          data: {
            summary: {
              totalRevenue,
              totalExpenses,
              netIncome: totalRevenue - totalExpenses,
              profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(2) : 0
            },
            breakdown: {
              revenueByMonth: revenueData.reduce((acc, invoice) => {
                const month = invoice.createdAt.toISOString().substring(0, 7);
                acc[month] = (acc[month] || 0) + Number(invoice.totalAmount);
                return acc;
              }, {} as Record<string, number>),
              expensesByCategory: expenseData.reduce((acc, expense) => {
                acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
                return acc;
              }, {} as Record<string, number>)
            }
          }
        };
        break;

      case 'RPT-002': // Property Performance Analysis
        const propertyPerformance = await prisma.property.findMany({
          include: {
            rentalUnits: {
              include: {
                agreements: {
                  where: { status: 'ACTIVE' },
                  include: {
                    invoices: {
                      where: { status: 'PAID' },
                      select: { totalAmount: true }
                    }
                  }
                }
              }
            },
            expenses: {
              select: { amount: true, category: true }
            }
          }
        });

        const propertiesAnalysis = propertyPerformance.map(property => {
          const totalRevenue = property.rentalUnits.reduce((sum, unit) => 
            sum + unit.agreements.reduce((agreementSum, agreement) => 
              agreementSum + agreement.invoices.reduce((invoiceSum, invoice) => 
                invoiceSum + Number(invoice.totalAmount), 0), 0), 0);
          
          const totalExpenses = property.expenses.reduce((sum, expense) => 
            sum + Number(expense.amount), 0);
          
          const occupiedUnits = property.rentalUnits.filter(unit => unit.status === 'OCCUPIED').length;
          const totalUnits = property.rentalUnits.length;

          return {
            id: property.id,
            name: property.name,
            address: property.address,
            city: property.city,
            totalUnits,
            occupiedUnits,
            occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits * 100).toFixed(2) : 0,
            revenue: totalRevenue,
            expenses: totalExpenses,
            profit: totalRevenue - totalExpenses,
            roi: totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses * 100).toFixed(2) : 0
          };
        });

        reportData = {
          id: reportId,
          title: "Property Performance Analysis",
          generatedDate: now.toISOString(),
          period: "Quarterly",
          data: {
            summary: {
              totalProperties,
              averageOccupancy: totalUnits > 0 ? (occupiedUnits / totalUnits * 100).toFixed(2) : 0,
              topPerformers: propertiesAnalysis.sort((a, b) => b.profit - a.profit).slice(0, 5)
            },
            properties: propertiesAnalysis
          }
        };
        break;

      case 'RPT-003': // Maintenance Cost Report
        const maintenanceExpenses = await prisma.propertyExpense.findMany({
          where: {
            category: { in: ['MAINTENANCE', 'REPAIRS'] }
          },
          include: {
            property: {
              select: { name: true, address: true }
            }
          },
          orderBy: { expenseDate: 'desc' }
        });

        const maintenanceByProperty = maintenanceExpenses.reduce((acc, expense) => {
          const propertyName = expense.property.name;
          if (!acc[propertyName]) {
            acc[propertyName] = {
              propertyName,
              totalAmount: 0,
              expenseCount: 0,
              expenses: []
            };
          }
          acc[propertyName].totalAmount += Number(expense.amount);
          acc[propertyName].expenseCount += 1;
          acc[propertyName].expenses.push(expense);
          return acc;
        }, {} as Record<string, any>);

        reportData = {
          id: reportId,
          title: "Maintenance Cost Report",
          generatedDate: now.toISOString(),
          period: "Monthly",
          data: {
            summary: {
              totalMaintenanceCost: maintenanceExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
              totalExpenses: maintenanceExpenses.length,
              averageCostPerProperty: Object.keys(maintenanceByProperty).length > 0 ? 
                maintenanceExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0) / Object.keys(maintenanceByProperty).length : 0
            },
            byProperty: Object.values(maintenanceByProperty),
            recentExpenses: maintenanceExpenses.slice(0, 20)
          }
        };
        break;

      case 'RPT-004': // Tenant Analysis Report
        const tenantData = await prisma.tenant.findMany({
          include: {
            agreements: {
              include: {
                invoices: {
                  select: { status: true, totalAmount: true, dueDate: true }
                }
              }
            }
          }
        });

        const tenantAnalysis = tenantData.map(tenant => {
          const totalInvoices = tenant.agreements.reduce((sum, agreement) => sum + agreement.invoices.length, 0);
          const paidInvoices = tenant.agreements.reduce((sum, agreement) => 
            sum + agreement.invoices.filter(invoice => invoice.status === 'PAID').length, 0);
          const overdueInvoices = tenant.agreements.reduce((sum, agreement) => 
            sum + agreement.invoices.filter(invoice => 
              invoice.status === 'PENDING' && new Date(invoice.dueDate) < now).length, 0);
          const totalOwed = tenant.agreements.reduce((sum, agreement) => 
            sum + agreement.invoices.filter(invoice => invoice.status === 'PENDING')
              .reduce((invoiceSum, invoice) => invoiceSum + Number(invoice.totalAmount), 0), 0);

          return {
            id: tenant.id,
            name: `${tenant.firstName} ${tenant.lastName}`,
            email: tenant.email,
            phone: tenant.phone,
            status: tenant.status,
            totalInvoices,
            paidInvoices,
            overdueInvoices,
            paymentSuccessRate: totalInvoices > 0 ? (paidInvoices / totalInvoices * 100).toFixed(2) : 0,
            totalOwed
          };
        });

        reportData = {
          id: reportId,
          title: "Tenant Analysis Report",
          generatedDate: now.toISOString(),
          period: "Quarterly",
          data: {
            summary: {
              totalTenants,
              activeTenants,
              paymentSuccessRate: totalInvoices > 0 ? (paidInvoices / totalInvoices * 100).toFixed(2) : 0,
              totalOutstanding: tenantAnalysis.reduce((sum, tenant) => sum + tenant.totalOwed, 0)
            },
            tenants: tenantAnalysis
          }
        };
        break;

      case 'RPT-005': // Income vs Expense Analysis
        const monthlyTrend = [];
        for (let i = 11; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          
          const monthRevenue = await prisma.realEstateInvoice.findMany({
            where: {
              status: 'PAID',
              updatedAt: { gte: monthStart, lte: monthEnd }
            },
            select: { totalAmount: true }
          });

          const monthExpenses = await prisma.propertyExpense.findMany({
            where: {
              expenseDate: { gte: monthStart, lte: monthEnd }
            },
            select: { amount: true }
          });

          const revenue = monthRevenue.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
          const expenses = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

          monthlyTrend.push({
            month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            revenue,
            expenses,
            profit: revenue - expenses,
            profitMargin: revenue > 0 ? ((revenue - expenses) / revenue * 100).toFixed(2) : 0
          });
        }

        reportData = {
          id: reportId,
          title: "Income vs Expense Analysis",
          generatedDate: now.toISOString(),
          period: "Annual",
          data: {
            summary: {
              totalRevenue: monthlyTrend.reduce((sum, month) => sum + month.revenue, 0),
              totalExpenses: monthlyTrend.reduce((sum, month) => sum + month.expenses, 0),
              totalProfit: monthlyTrend.reduce((sum, month) => sum + month.profit, 0),
              averageMonthlyProfit: monthlyTrend.reduce((sum, month) => sum + month.profit, 0) / monthlyTrend.length
            },
            monthlyTrend
          }
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        );
    }

    return NextResponse.json(reportData);

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST - Generate new report
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { format = 'pdf', includeCharts = true } = body;

    // In a real implementation, this would trigger report generation
    // For now, we'll return a mock response

    const reportId = id;
    const now = new Date();

    return NextResponse.json({
      reportId,
      status: 'generating',
      estimatedTime: '2-3 minutes',
      format,
      includeCharts,
      generatedAt: now.toISOString(),
      downloadUrl: `/api/real-estate/reports/${reportId}/download`
    });

  } catch (error) {
    console.error('Error initiating report generation:', error);
    return NextResponse.json(
      { error: 'Failed to initiate report generation', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 