import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'ASSIGNED', 'DELIVERED', 'ACTIVE', 'COLLECTING', 'COMPLETED', 'CANCELLED']).optional(),
  driverId: z.string().nullable().optional(),
  notes: z.string().optional(),
  setupTime: z.string().optional(),
  deliveredAt: z.string().transform(val => val ? new Date(val) : undefined).optional(),
  collectedAt: z.string().transform(val => val ? new Date(val) : undefined).optional(),
  eventDate: z.string().transform(val => val ? new Date(val) : undefined).optional(),
  eventEndDate: z.string().transform(val => val ? new Date(val) : undefined).optional(),
  eventTime: z.string().optional(),
  discountAmount: z.number().optional(),
});

async function getHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const { id } = await params;const order = await prisma.marahOrder.findUnique({
      where: { id: id },
      include: {
        customer: {
          include: {
            addresses: true,
          },
        },
        address: true,
        driver: true,
        items: {
          include: {
            game: true,
          },
        },
        payments: true,
        company: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (order.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const { id } = await params;const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    // Get the order first to verify ownership
    const existingOrder = await prisma.marahOrder.findUnique({
      where: { id: id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingOrder.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If driverId is provided, verify the driver exists and belongs to the same company
    if (validatedData.driverId) {
      const driver = await prisma.marahDriver.findFirst({
        where: {
          id: validatedData.driverId,
          companyId: existingOrder.companyId,
        },
      });

      if (!driver) {
        return NextResponse.json({ 
          error: 'Driver not found or does not belong to this company' 
        }, { status: 400 });
      }
    }

    // Update the order
    const updatedOrder = await prisma.marahOrder.update({
      where: { id: id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        address: true,
        driver: true,
        items: {
          include: {
            game: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    
    // Handle Prisma foreign key constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2003') {
        return NextResponse.json({ 
          error: 'Foreign key constraint failed. Please check that all referenced data exists.',
          details: 'The driver or other referenced entity may not exist or may not belong to your company.'
        }, { status: 400 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
    }
    
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const { id } = await params;// Get the order first to verify ownership
    const existingOrder = await prisma.marahOrder.findUnique({
      where: { id: id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingOrder.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete order items first (due to foreign key constraints)
    await prisma.marahOrderItem.deleteMany({
      where: { orderId: id },
    });

    // Delete payments
    await prisma.marahPayment.deleteMany({
      where: { orderId: id },
    });

    // Delete the order
    await prisma.marahOrder.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler); 