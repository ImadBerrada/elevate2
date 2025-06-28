import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { startOfDay, endOfDay, subDays, format, eachDayOfInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // Default to 30 days
    const facilityId = searchParams.get('facilityId');

    const now = new Date();
    const startDate = subDays(now, parseInt(period));
    const endDate = now;

    // Get facilities with rooms
    const facilities = await prisma.retreatFacility.findMany({
      where: facilityId ? { id: facilityId } : {},
      include: {
        rooms: true,
        retreats: {
          include: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'COMPLETED'] },
                checkInDate: { lte: endDate },
                checkOutDate: { gte: startDate }
              },
              include: {
                guest: true,
                retreat: true
              }
            }
          }
        }
      }
    });

    // Get all bookings in the date range
    const bookings = await prisma.retreatBooking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        checkInDate: { lte: endDate },
        checkOutDate: { gte: startDate }
      },
      include: {
        guest: true,
        retreat: {
          include: {
            facility: true
          }
        },
        room: true
      }
    });

    // Calculate total capacity
    const totalCapacity = facilities.reduce((sum: number, facility: any) => sum + (facility.capacity || 0), 0);
    const totalRooms = facilities.reduce((sum: number, facility: any) => sum + facility.rooms.length, 0);

    // Generate daily occupancy data
    const dailyOccupancy = [];
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    for (const day of days) {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      // Count occupied rooms/units for this day
      const dayBookings = bookings.filter((booking: any) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        return checkIn <= dayEnd && checkOut >= dayStart;
      });

      const occupiedRooms = dayBookings.length;
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

      // Calculate revenue for this day
      const dayRevenue = dayBookings.reduce((sum: number, booking: any) => {
        const stayDuration = Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
        const dailyRate = Number(booking.totalAmount) / stayDuration;
        return sum + dailyRate;
      }, 0);

      const averageDailyRate = occupiedRooms > 0 ? dayRevenue / occupiedRooms : 0;
      const revPAR = totalRooms > 0 ? dayRevenue / totalRooms : 0;

      dailyOccupancy.push({
        date: format(day, 'yyyy-MM-dd'),
        totalRooms,
        occupiedRooms,
        occupancyRate,
        revenue: dayRevenue,
        averageDailyRate,
        revPAR
      });
    }

    // Calculate room type occupancy
    const roomTypeOccupancy = [];
    const roomTypes = [...new Set(facilities.flatMap((f: any) => f.rooms.map((r: any) => r.roomType)))];

    for (const roomType of roomTypes) {
      const typeRooms = facilities.flatMap((f: any) => f.rooms.filter((r: any) => r.roomType === roomType));
      const totalTypeRooms = typeRooms.length;

      const typeBookings = bookings.filter(booking => booking.room?.roomType === roomType);
      const typeRevenue = typeBookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
      const averageOccupancy = totalTypeRooms > 0 ? (typeBookings.length / totalTypeRooms) * 100 : 0;
      const averageDailyRate = typeBookings.length > 0 ? typeRevenue / typeBookings.length : 0;
      const revPAR = totalTypeRooms > 0 ? typeRevenue / totalTypeRooms : 0;

      // Calculate trend (compare with previous period)
      const previousPeriodStart = subDays(startDate, Math.abs(startDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
      const previousBookings = await prisma.retreatBooking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          checkInDate: { lte: startDate },
          checkOutDate: { gte: previousPeriodStart },
          room: { roomType }
        }
      });

      const previousOccupancy = totalTypeRooms > 0 ? (previousBookings.length / totalTypeRooms) * 100 : 0;
      const trend = previousOccupancy > 0 ? ((averageOccupancy - previousOccupancy) / previousOccupancy) * 100 : 0;

      roomTypeOccupancy.push({
        roomType,
        totalRooms: totalTypeRooms,
        averageOccupancy,
        revenue: typeRevenue,
        averageDailyRate,
        revPAR,
        trend
      });
    }

    // Calculate seasonal trends (monthly data for last 12 months)
    const seasonalTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const monthBookings = await prisma.retreatBooking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          checkInDate: { lte: monthEnd },
          checkOutDate: { gte: monthStart }
        }
      });

      const monthRevenue = monthBookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
      const monthOccupancy = totalRooms > 0 ? (monthBookings.length / totalRooms) * 100 : 0;
      const monthADR = monthBookings.length > 0 ? monthRevenue / monthBookings.length : 0;

      seasonalTrends.push({
        month: format(monthStart, 'MMM'),
        occupancyRate: monthOccupancy,
        revenue: monthRevenue,
        bookings: monthBookings.length,
        averageDailyRate: monthADR
      });
    }

    // Calculate current metrics
    const currentBookings = bookings.filter(booking => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return checkIn <= now && checkOut >= now;
    });

    const currentOccupancy = totalRooms > 0 ? (currentBookings.length / totalRooms) * 100 : 0;
    const averageOccupancy = dailyOccupancy.length > 0 ? 
      dailyOccupancy.reduce((sum, day) => sum + day.occupancyRate, 0) / dailyOccupancy.length : 0;
    const peakOccupancy = dailyOccupancy.length > 0 ? 
      Math.max(...dailyOccupancy.map(day => day.occupancyRate)) : 0;
    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
    const revPAR = totalRooms > 0 ? totalRevenue / totalRooms : 0;
    const averageDailyRate = bookings.length > 0 ? totalRevenue / bookings.length : 0;
    const totalBookings = bookings.length;

    // Calculate average stay length
    const averageStayLength = bookings.length > 0 ? 
      bookings.reduce((sum, booking) => {
        const stayDuration = Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
        return sum + stayDuration;
      }, 0) / bookings.length : 0;

    const metrics = {
      currentOccupancy,
      averageOccupancy,
      peakOccupancy,
      totalRevenue,
      revPAR,
      averageDailyRate,
      totalBookings,
      averageStayLength,
      totalRooms,
      totalCapacity
    };

    return NextResponse.json({
      dailyOccupancy,
      roomTypeOccupancy,
      seasonalTrends,
      metrics,
      facilities: facilities.map(f => ({
        id: f.id,
        name: f.name,
        capacity: f.capacity,
        totalRooms: f.rooms.length,
        currentOccupancy: f.currentOccupancy || 0
      })),
      period,
      dateRange: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
      }
    });

  } catch (error) {
    console.error('Occupancy reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occupancy data' },
      { status: 500 }
    );
  }
}