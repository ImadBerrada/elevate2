import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET - Get invoice statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || '';
    const propertyId = searchParams.get('propertyId') || '';
    const agreementId = searchParams.get('agreementId') || '';

    // Build where clause for filtering
    const where: any = {};
    
    if (agreementId) {
      where.agreementId = agreementId;
    } else if (tenantId) {
      where.agreement = {
        tenantId: tenantId
      };
    } else if (propertyId) {
      where.agreement = {
        propertyId: propertyId
      };
    }

    // Get current date for calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    try {
      // Get total invoice count
      const totalInvoices = await prisma.realEstateInvoice.count({ where });

      // Get paid invoices count
      const paidInvoices = await prisma.realEstateInvoice.count({
        where: { ...where, status: 'PAID' }
      });

      // Get overdue invoices count
      const overdueInvoices = await prisma.realEstateInvoice.count({
        where: {
          ...where,
          status: 'PENDING',
          dueDate: { lt: now }
        }
      });

      // Get pending amount (unpaid invoices)
      const pendingInvoicesData = await prisma.realEstateInvoice.findMany({
        where: {
          ...where,
          status: { in: ['PENDING', 'OVERDUE'] }
        },
        select: {
          totalAmount: true
        }
      });

      const pendingAmount = pendingInvoicesData.reduce((sum, invoice) => {
        return sum + (invoice.totalAmount ? Number(invoice.totalAmount) : 0);
      }, 0);

      // Get total revenue (paid invoices)
      const revenueData = await prisma.realEstateInvoice.findMany({
        where: {
          ...where,
          status: 'PAID'
        },
        select: {
          totalAmount: true
        }
      });

      const totalRevenue = revenueData.reduce((sum, invoice) => {
        return sum + (invoice.totalAmount ? Number(invoice.totalAmount) : 0);
      }, 0);

      // Calculate average payment time for paid invoices
      const paidInvoicesWithDates = await prisma.realEstateInvoice.findMany({
        where: {
          ...where,
          status: 'PAID'
        },
        select: {
          dueDate: true,
          updatedAt: true,
          createdAt: true
        }
      });

      let avgPaymentTime = 0;
      if (paidInvoicesWithDates.length > 0) {
        const totalPaymentDays = paidInvoicesWithDates.reduce((sum, invoice) => {
          const paymentDate = invoice.updatedAt || invoice.createdAt;
          const daysToPayment = Math.ceil(
            (paymentDate.getTime() - invoice.createdAt.getTime()) / (1000 * 3600 * 24)
          );
          return sum + Math.max(1, daysToPayment); // Minimum 1 day
        }, 0);
        
        avgPaymentTime = Math.round(totalPaymentDays / paidInvoicesWithDates.length);
      }

      // Calculate monthly growth (compare last 30 days with previous 30 days)
      const lastThirtyDaysCount = await prisma.realEstateInvoice.count({
        where: {
          ...where,
          createdAt: { gte: thirtyDaysAgo }
        }
      });

      const previousThirtyDaysCount = await prisma.realEstateInvoice.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(thirtyDaysAgo.getTime() - (30 * 24 * 60 * 60 * 1000)),
            lt: thirtyDaysAgo
          }
        }
      });

      const monthlyGrowth = previousThirtyDaysCount > 0 
        ? Math.round(((lastThirtyDaysCount - previousThirtyDaysCount) / previousThirtyDaysCount) * 100)
        : lastThirtyDaysCount > 0 ? 100 : 0;

      // Calculate additional metrics
      const paymentSuccessRate = totalInvoices > 0 
        ? Math.round((paidInvoices / totalInvoices) * 100)
        : 0;

      const overdueRate = totalInvoices > 0 
        ? Math.round((overdueInvoices / totalInvoices) * 100)
        : 0;

      // Get recent invoice activity (last 7 days)
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      const recentActivity = await prisma.realEstateInvoice.count({
        where: {
          ...where,
          createdAt: { gte: sevenDaysAgo }
        }
      });

      const stats = {
        totalInvoices,
        paidInvoices,
        pendingAmount,
        overdueInvoices,
        totalRevenue,
        avgPaymentTime,
        monthlyGrowth,
        paymentSuccessRate,
        overdueRate,
        recentActivity,
        metrics: {
          pendingInvoicesCount: totalInvoices - paidInvoices,
          collectionEfficiency: paymentSuccessRate,
          averageInvoiceValue: totalInvoices > 0 ? Math.round(totalRevenue / totalInvoices) : 0,
          lastUpdated: now.toISOString()
        }
      };

      return NextResponse.json({ stats });

    } catch (dbError) {
      console.error('Database error in invoice stats:', dbError);
      
      // Return fallback stats if database queries fail
      const fallbackStats = {
        totalInvoices: 0,
        paidInvoices: 0,
        pendingAmount: 0,
        overdueInvoices: 0,
        totalRevenue: 0,
        avgPaymentTime: 0,
        monthlyGrowth: 0,
        paymentSuccessRate: 0,
        overdueRate: 0,
        recentActivity: 0,
        metrics: {
          pendingInvoicesCount: 0,
          collectionEfficiency: 0,
          averageInvoiceValue: 0,
          lastUpdated: new Date().toISOString()
        }
      };

      return NextResponse.json({ stats: fallbackStats });
    }

  } catch (error) {
    console.error('Error fetching invoice statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice statistics' },
      { status: 500 }
    );
  }
} 