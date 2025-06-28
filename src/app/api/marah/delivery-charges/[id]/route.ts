import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { verifyCompanyAccess } from '@/lib/company-access';

const updateDeliveryChargeSchema = z.object({
  zone: z.string().min(1, 'Zone is required').optional(),
  area: z.string().optional(),
  charge: z.number().positive().optional(), // For backward compatibility
  baseCharge: z.number().positive().optional(),
  perKmCharge: z.number().positive().optional(),
  minimumCharge: z.number().positive().optional(),
  maximumCharge: z.number().positive().optional(),
  estimatedTime: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

async function getHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deliveryCharge = await prisma.marahDeliveryCharge.findUnique({
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

    if (!deliveryCharge) {
      return NextResponse.json({ error: 'Delivery charge not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (deliveryCharge.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Convert Decimal to number for JSON serialization
    const deliveryChargeWithNumbers = {
      ...deliveryCharge,
      baseCharge: Number(deliveryCharge.baseCharge),
      perKmCharge: Number(deliveryCharge.perKmCharge),
      minimumCharge: Number(deliveryCharge.minimumCharge),
      maximumCharge: deliveryCharge.maximumCharge ? Number(deliveryCharge.maximumCharge) : undefined,
    };

    return NextResponse.json(deliveryChargeWithNumbers);
  } catch (error) {
    console.error('Error fetching delivery charge:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery charge' }, { status: 500 });
  }
}

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateDeliveryChargeSchema.parse(body);

    // Get the delivery charge first to verify ownership
    const existingDeliveryCharge = await prisma.marahDeliveryCharge.findUnique({
      where: { id: id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingDeliveryCharge) {
      return NextResponse.json({ error: 'Delivery charge not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingDeliveryCharge.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if zone already exists for this company (if zone is being updated)
    if (validatedData.zone && validatedData.zone !== existingDeliveryCharge.zone) {
      const existingZone = await prisma.marahDeliveryCharge.findFirst({
        where: {
          zone: validatedData.zone,
          companyId: existingDeliveryCharge.companyId,
          id: { not: id },
        },
      });

      if (existingZone) {
        return NextResponse.json({ error: 'Delivery charge for this zone already exists' }, { status: 400 });
      }
    }

    // Update the delivery charge
    const updatedDeliveryCharge = await prisma.marahDeliveryCharge.update({
      where: { id: id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    // Convert Decimal to number for JSON serialization
    const deliveryChargeWithNumbers = {
      ...updatedDeliveryCharge,
      baseCharge: Number(updatedDeliveryCharge.baseCharge),
      perKmCharge: Number(updatedDeliveryCharge.perKmCharge),
      minimumCharge: Number(updatedDeliveryCharge.minimumCharge),
      maximumCharge: updatedDeliveryCharge.maximumCharge ? Number(updatedDeliveryCharge.maximumCharge) : undefined,
    };

    return NextResponse.json(deliveryChargeWithNumbers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating delivery charge:', error);
    return NextResponse.json({ error: 'Failed to update delivery charge' }, { status: 500 });
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get the delivery charge first to verify ownership
    const existingDeliveryCharge = await prisma.marahDeliveryCharge.findUnique({
      where: { id: id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingDeliveryCharge) {
      return NextResponse.json({ error: 'Delivery charge not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingDeliveryCharge.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if delivery charge is being used in any orders
    const ordersUsingCharge = await prisma.marahOrder.count({
      where: {
        address: {
          zone: existingDeliveryCharge.zone,
        },
      },
    });

    if (ordersUsingCharge > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete delivery charge that is being used in orders. Consider marking it as inactive instead.' 
      }, { status: 400 });
    }

    // Delete the delivery charge
    await prisma.marahDeliveryCharge.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Delivery charge deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery charge:', error);
    return NextResponse.json({ error: 'Failed to delete delivery charge' }, { status: 500 });
  }
}

export const GET = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(getHandler);
export const PUT = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(putHandler);
export const DELETE = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(deleteHandler); 