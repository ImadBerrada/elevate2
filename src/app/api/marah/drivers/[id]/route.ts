import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const updateDriverSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  phone: z.string().min(1, 'Phone is required').optional(),
  email: z.string().email().optional().or(z.literal('')),
  licenseNumber: z.string().optional(),
  vehicleInfo: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BUSY']).optional(),
  notes: z.string().optional(),
});

async function getHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driver = await prisma.marahDriver.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          include: {
            customer: true,
            items: {
              include: {
                game: true,
              },
            },
          },
          orderBy: { orderDate: 'desc' },
        },
        company: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (driver.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Calculate driver statistics
    const totalOrders = driver.orders.length;
    const completedOrders = driver.orders.filter(order => order.status === 'COMPLETED').length;
    const activeOrders = driver.orders.filter(order => 
      ['ASSIGNED', 'DELIVERED', 'ACTIVE'].includes(order.status)
    ).length;
    const totalRevenue = driver.orders
      .filter(order => order.status === 'COMPLETED')
      .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

    const driverWithStats = {
      ...driver,
      totalOrders,
      completedOrders,
      activeOrders,
      totalRevenue,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    };

    return NextResponse.json(driverWithStats);
  } catch (error) {
    console.error('Error fetching driver:', error);
    return NextResponse.json({ error: 'Failed to fetch driver' }, { status: 500 });
  }
}

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateDriverSchema.parse(body);

    // Get the driver first to verify ownership
    const existingDriver = await prisma.marahDriver.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingDriver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingDriver.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the driver
    const updatedDriver = await prisma.marahDriver.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
        updatedAt: new Date(),
      },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            orderDate: true,
            eventDate: true,
          },
          orderBy: { orderDate: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json(updatedDriver);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating driver:', error);
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 });
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the driver first to verify ownership
    const existingDriver = await prisma.marahDriver.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
        orders: {
          where: {
            status: {
              in: ['ASSIGNED', 'DELIVERED', 'ACTIVE'],
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingDriver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingDriver.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if driver has active orders
    if (existingDriver.orders.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete driver with active orders. Please reassign or complete orders first.' 
      }, { status: 400 });
    }

    // Unassign driver from all orders (set driverId to null)
    await prisma.marahOrder.updateMany({
      where: { driverId: params.id },
      data: { driverId: null },
    });

    // Delete the driver
    await prisma.marahDriver.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return NextResponse.json({ error: 'Failed to delete driver' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler); 