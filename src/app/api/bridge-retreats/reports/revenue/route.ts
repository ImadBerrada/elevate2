import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subMonths, startOfMonth, endOfMonth, format, parseISO } from 'date-fns';

// Types for revenue calculations
interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  averageDailyRate: number;
  revPAR: number;
  grossProfit: number;
  profitMargin: number;
  forecastedRevenue: number;
  yearOverYearGrowth: number;
  totalBookings: number;
  averageBookingValue: number;
  occupancyRate: number;
}

interface RevenueByRetreatType {
  retreatType: string;
  revenue: number;
  bookings: number;
  averageValue: number;
  profitMargin: number;
  costs: number;
  netProfit: number;
  growthRate: number;
  marketShare: number;
}

// Cache for expensive calculations
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '12m';
    const retreatType = searchParams.get('retreatType') || 'ALL';
    const includeParams = searchParams.get('include')?.split(',') || ['metrics'];
    
    // Generate cache key
    const cacheKey = `revenue-${period}-${retreatType}-${includeParams.join(',')}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Calculate date range
    const endDate = endOfMonth(new Date());
    const monthsBack = period === '12m' ? 12 : period === '6m' ? 6 : 3;
    const startDate = startOfMonth(subMonths(endDate, monthsBack));

    // Build WHERE clause for filtering
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: {
        in: ['CONFIRMED', 'COMPLETED']
      }
    };

    if (retreatType !== 'ALL') {
      whereClause.retreat = {
        type: retreatType.toUpperCase()
      };
    }

    // Fetch bookings with related data
    const bookings = await prisma.retreatBooking.findMany({
      where: whereClause,
      include: {
        retreat: {
          select: {
            id: true,
            title: true,
            type: true,
            price: true,
            capacity: true
          }
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get previous period bookings for comparison
    const previousStartDate = startOfMonth(subMonths(startDate, monthsBack));
    const previousEndDate = endOfMonth(subMonths(endDate, monthsBack));
    
    const previousBookings = await prisma.retreatBooking.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate
        }
      },
      include: {
        retreat: {
          select: {
            type: true,
            price: true
          }
        }
      }
    });

    // Calculate revenue metrics
    const currentRevenue = bookings.reduce((sum: number, booking: any) => {
      return sum + (booking.totalAmount || 0);
    }, 0);

    const previousRevenue = previousBookings.reduce((sum: number, booking: any) => {
      return sum + (booking.totalAmount || 0);
    }, 0);

    // Calculate costs (estimated at 30% of revenue for operational costs)
    const operationalCostRate = 0.30;
    const totalCosts = currentRevenue * operationalCostRate;
    const grossProfit = currentRevenue - totalCosts;

    // Revenue growth calculation
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Calculate monthly revenue (current month)
    const currentMonth = startOfMonth(new Date());
    const currentMonthBookings = bookings.filter(booking => 
      booking.createdAt >= currentMonth
    );
    
    const monthlyRevenue = currentMonthBookings.reduce((sum: number, booking: any) => {
      return sum + (booking.totalAmount || 0);
    }, 0);

    // Calculate ADR and RevPAR
    const totalBookings = bookings.length;
    const averageDailyRate = totalBookings > 0 ? currentRevenue / totalBookings : 0;
    
    // Get total capacity from facilities
    const facilities = await prisma.retreatFacility.findMany({
      include: {
        rooms: true
      }
    });
    
    const totalCapacity = facilities.reduce((sum: number, facility: any) => 
      sum + facility.rooms.reduce((roomSum: number, room: any) => roomSum + (room.capacity || 0), 0), 0
    );
    
    const occupancyRate = totalCapacity > 0 
      ? (bookings.reduce((sum: number, booking: any) => sum + (booking.numberOfGuests || 0), 0) / totalCapacity) * 100 
      : 0;
    
    const revPAR = averageDailyRate * (occupancyRate / 100);

    // Simple forecasting based on current trends
    const monthlyGrowthRate = revenueGrowth / monthsBack;
    const forecastedRevenue = currentRevenue * (1 + (monthlyGrowthRate / 100));

    // Year over year growth (if we have data from last year)
    const yearAgoStart = startOfMonth(subMonths(startDate, 12));
    const yearAgoEnd = endOfMonth(subMonths(endDate, 12));
    
    const yearAgoBookings = await prisma.retreatBooking.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: yearAgoStart,
          lte: yearAgoEnd
        }
      }
    });

    const yearAgoRevenue = yearAgoBookings.reduce((sum: number, booking: any) => {
      return sum + (booking.totalAmount || 0);
    }, 0);

    const yearOverYearGrowth = yearAgoRevenue > 0 
      ? ((currentRevenue - yearAgoRevenue) / yearAgoRevenue) * 100 
      : 0;

    const metrics: RevenueMetrics = {
      totalRevenue: currentRevenue,
      monthlyRevenue,
      revenueGrowth,
      averageDailyRate,
      revPAR,
      grossProfit,
      profitMargin: currentRevenue > 0 ? (grossProfit / currentRevenue) * 100 : 0,
      forecastedRevenue,
      yearOverYearGrowth,
      totalBookings,
      averageBookingValue: totalBookings > 0 ? currentRevenue / totalBookings : 0,
      occupancyRate
    };

    // Calculate revenue by retreat type
    const retreatTypeRevenue: RevenueByRetreatType[] = [];
    const typeMap = new Map<string, any>();

    bookings.forEach((booking: any) => {
      if (!booking.retreat) return;
      
      const type = booking.retreat.type;
      const revenue = booking.totalAmount || 0;
      
      if (!typeMap.has(type)) {
        typeMap.set(type, {
          retreatType: type,
          revenue: 0,
          bookings: 0,
          costs: 0
        });
      }
      
      const typeData = typeMap.get(type);
      typeData.revenue += revenue;
      typeData.bookings += 1;
      typeData.costs += revenue * operationalCostRate;
    });

    typeMap.forEach((data, type) => {
      const netProfit = data.revenue - data.costs;
      const profitMargin = data.revenue > 0 ? (netProfit / data.revenue) * 100 : 0;
      const marketShare = currentRevenue > 0 ? (data.revenue / currentRevenue) * 100 : 0;
      
      // Calculate growth rate for this type
      const previousTypeRevenue = previousBookings
        .filter((b: any) => b.retreat?.type === type)
        .reduce((sum: number, booking: any) => {
          return sum + (booking.totalAmount || 0);
        }, 0);
      
      const growthRate = previousTypeRevenue > 0 
        ? ((data.revenue - previousTypeRevenue) / previousTypeRevenue) * 100 
        : 0;

      retreatTypeRevenue.push({
        retreatType: type,
        revenue: data.revenue,
        bookings: data.bookings,
        averageValue: data.bookings > 0 ? data.revenue / data.bookings : 0,
        profitMargin,
        costs: data.costs,
        netProfit,
        growthRate,
        marketShare
      });
    });

    // Sort by revenue descending
    retreatTypeRevenue.sort((a, b) => b.revenue - a.revenue);

    // Generate monthly data
    const monthlyData = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(endDate, i));
      const monthEnd = endOfMonth(subMonths(endDate, i));
      
      const monthBookings = bookings.filter(booking => 
        booking.createdAt >= monthStart && booking.createdAt <= monthEnd
      );
      
      const monthRevenue = monthBookings.reduce((sum, booking) => {
        const totalPaid = booking.totalAmount || 0;
        return sum + totalPaid;
      }, 0);
      
      const monthCosts = monthRevenue * operationalCostRate;
      const monthProfit = monthRevenue - monthCosts;
      const monthTarget = currentRevenue / monthsBack; // Simple target calculation
      const variance = monthTarget > 0 ? ((monthRevenue - monthTarget) / monthTarget) * 100 : 0;

      monthlyData.push({
        month: format(monthStart, 'yyyy-MM'),
        revenue: monthRevenue,
        costs: monthCosts,
        profit: monthProfit,
        bookings: monthBookings.length,
        averageDailyRate: monthBookings.length > 0 ? monthRevenue / monthBookings.length : 0,
        occupancyRate: totalCapacity > 0 
          ? (monthBookings.reduce((sum, booking) => sum + (booking.numberOfGuests || 0), 0) / totalCapacity) * 100 
          : 0,
        target: monthTarget,
        variance
      });
    }

    // Cost analysis
    const costAnalysis = [
      {
        category: 'Staff Costs',
        amount: totalCosts * 0.4, // 40% of total costs
        percentage: 40,
        trend: 2.1,
        budget: totalCosts * 0.38,
        variance: 5.3,
        subcategories: [
          { name: 'Salaries', amount: totalCosts * 0.25, percentage: 62.5 },
          { name: 'Benefits', amount: totalCosts * 0.1, percentage: 25 },
          { name: 'Training', amount: totalCosts * 0.05, percentage: 12.5 }
        ]
      },
      {
        category: 'Facility Maintenance',
        amount: totalCosts * 0.25, // 25% of total costs
        percentage: 25,
        trend: -1.2,
        budget: totalCosts * 0.26,
        variance: -3.8,
        subcategories: [
          { name: 'Cleaning', amount: totalCosts * 0.15, percentage: 60 },
          { name: 'Repairs', amount: totalCosts * 0.06, percentage: 24 },
          { name: 'Utilities', amount: totalCosts * 0.04, percentage: 16 }
        ]
      },
      {
        category: 'Food & Beverage',
        amount: totalCosts * 0.2, // 20% of total costs
        percentage: 20,
        trend: 3.5,
        budget: totalCosts * 0.19,
        variance: 5.3,
        subcategories: [
          { name: 'Ingredients', amount: totalCosts * 0.14, percentage: 70 },
          { name: 'Service', amount: totalCosts * 0.04, percentage: 20 },
          { name: 'Equipment', amount: totalCosts * 0.02, percentage: 10 }
        ]
      },
      {
        category: 'Marketing & Sales',
        amount: totalCosts * 0.15, // 15% of total costs
        percentage: 15,
        trend: 8.2,
        budget: totalCosts * 0.17,
        variance: -11.8,
        subcategories: [
          { name: 'Digital Marketing', amount: totalCosts * 0.09, percentage: 60 },
          { name: 'Events', amount: totalCosts * 0.04, percentage: 26.7 },
          { name: 'Materials', amount: totalCosts * 0.02, percentage: 13.3 }
        ]
      }
    ];

    // Forecast data
    const forecastData = [];
    for (let i = 1; i <= 3; i++) {
      const forecastMonth = format(subMonths(new Date(), -i), 'yyyy-MM');
      const baseForcast = monthlyRevenue * (1 + (monthlyGrowthRate / 100) * i);
      const confidence = Math.max(60, 90 - (i * 10)); // Decreasing confidence
      
      forecastData.push({
        month: forecastMonth,
        forecast: baseForcast,
        confidence,
        factors: [
          'Historical trends',
          'Seasonal patterns',
          i === 1 ? 'Current bookings' : 'Market conditions',
          i <= 2 ? 'Marketing campaigns' : 'Economic factors'
        ],
        lowerBound: baseForcast * 0.85,
        upperBound: baseForcast * 1.15
      });
    }

    // Build response data
    const responseData = {
      success: true,
      data: {
        metrics,
        retreatTypeRevenue: includeParams.includes('metrics') ? retreatTypeRevenue : [],
        monthlyData: includeParams.includes('trends') ? monthlyData : [],
        costAnalysis: includeParams.includes('costs') ? costAnalysis : [],
        forecastData: includeParams.includes('forecasts') ? forecastData : [],
        lastUpdated: new Date().toISOString()
      },
      meta: {
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        totalRecords: bookings.length,
        currency: 'AED'
      }
    };

    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in revenue API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch revenue data',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Export route for revenue data
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const period = searchParams.get('period') || '12m';
    const retreatType = searchParams.get('retreatType') || 'ALL';
    
    // Get revenue data (reuse GET logic)
    const revenueResponse = await GET(request);
    const revenueData = await revenueResponse.json();
    
    if (!revenueData.success) {
      throw new Error('Failed to fetch revenue data for export');
    }

    let content: string;
    let contentType: string;
    let fileExtension: string;

    switch (format) {
      case 'csv':
        content = generateCSV(revenueData.data);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
      
      case 'excel':
        // For Excel format, you'd typically use a library like 'xlsx'
        content = generateCSV(revenueData.data); // Fallback to CSV for now
        contentType = 'application/vnd.ms-excel';
        fileExtension = 'xls';
        break;
      
      case 'pdf':
        // For PDF format, you'd typically use a library like 'jspdf' or 'puppeteer'
        content = generateTextReport(revenueData.data);
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    const response = new NextResponse(content);
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', 
      `attachment; filename="revenue-report-${period}-${Date.now()}.${fileExtension}"`
    );
    
    return response;

  } catch (error) {
    console.error('Error in revenue export API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export revenue data',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate CSV content
function generateCSV(data: any): string {
  const lines = [];
  
  // Header
  lines.push('Revenue Report');
  lines.push('Generated: ' + new Date().toLocaleString());
  lines.push('');
  
  // Metrics
  lines.push('Key Metrics');
  lines.push('Metric,Value');
  lines.push(`Total Revenue,${data.metrics.totalRevenue}`);
  lines.push(`Monthly Revenue,${data.metrics.monthlyRevenue}`);
  lines.push(`Revenue Growth,${data.metrics.revenueGrowth}%`);
  lines.push(`Average Daily Rate,${data.metrics.averageDailyRate}`);
  lines.push(`RevPAR,${data.metrics.revPAR}`);
  lines.push(`Gross Profit,${data.metrics.grossProfit}`);
  lines.push(`Profit Margin,${data.metrics.profitMargin}%`);
  lines.push('');
  
  // Revenue by retreat type
  if (data.retreatTypeRevenue.length > 0) {
    lines.push('Revenue by Retreat Type');
    lines.push('Type,Revenue,Bookings,Average Value,Profit Margin,Growth Rate,Market Share');
    data.retreatTypeRevenue.forEach((type: any) => {
      lines.push(`${type.retreatType},${type.revenue},${type.bookings},${type.averageValue},${type.profitMargin}%,${type.growthRate}%,${type.marketShare}%`);
    });
    lines.push('');
  }
  
  // Monthly data
  if (data.monthlyData.length > 0) {
    lines.push('Monthly Performance');
    lines.push('Month,Revenue,Costs,Profit,Bookings,ADR,Occupancy Rate');
    data.monthlyData.forEach((month: any) => {
      lines.push(`${month.month},${month.revenue},${month.costs},${month.profit},${month.bookings},${month.averageDailyRate},${month.occupancyRate}%`);
    });
  }
  
  return lines.join('\n');
}

// Helper function to generate text report (simplified PDF content)
function generateTextReport(data: any): string {
  const lines = [];
  
  lines.push('REVENUE ANALYSIS REPORT');
  lines.push('='.repeat(50));
  lines.push('Generated: ' + new Date().toLocaleString());
  lines.push('');
  
  lines.push('EXECUTIVE SUMMARY');
  lines.push('-'.repeat(30));
  lines.push(`Total Revenue: AED ${data.metrics.totalRevenue.toLocaleString()}`);
  lines.push(`Gross Profit: AED ${data.metrics.grossProfit.toLocaleString()}`);
  lines.push(`Profit Margin: ${data.metrics.profitMargin.toFixed(1)}%`);
  lines.push(`Revenue Growth: ${data.metrics.revenueGrowth.toFixed(1)}%`);
  lines.push('');
  
  lines.push('PERFORMANCE BY RETREAT TYPE');
  lines.push('-'.repeat(30));
  data.retreatTypeRevenue.forEach((type: any) => {
    lines.push(`${type.retreatType}:`);
    lines.push(`  Revenue: AED ${type.revenue.toLocaleString()}`);
    lines.push(`  Bookings: ${type.bookings}`);
    lines.push(`  Market Share: ${type.marketShare.toFixed(1)}%`);
    lines.push('');
  });
  
  return lines.join('\n');
} 