import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { verifyCompanyAccess } from '@/lib/company-access';

const updateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  phone: z.string().min(1, 'Phone is required').optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
  balance: z.number().optional(),
});

async function getHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.marahCustomer.findUnique({
      where: { id: id },
      include: {
        addresses: true,
        orders: {
          include: {
            items: {
              include: {
                game: true,
              },
            },
            payments: true,
            driver: true,
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

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(request.user!.userId, request.user!.role, customer.companyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Company access denied' }, { status: 403 });
    }

    // Calculate customer statistics
    const totalOrders = customer.orders.length;
    const completedOrders = customer.orders.filter(order => order.status === 'COMPLETED').length;
    const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const lastOrderDate = customer.orders.length > 0 ? customer.orders[0].orderDate : null;

    const customerWithStats = {
      ...customer,
      totalOrders,
      completedOrders,
      totalSpent,
      lastOrderDate,
      registrationDate: customer.createdAt,
    };

    return NextResponse.json(customerWithStats);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCustomerSchema.parse(body);

    // Get the customer first to verify ownership
    const existingCustomer = await prisma.marahCustomer.findUnique({
      where: { id: id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingCustomer.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the customer
    const updatedCustomer = await prisma.marahCustomer.update({
      where: { id: id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
        updatedAt: new Date(),
      },
      include: {
        addresses: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            orderDate: true,
          },
          orderBy: { orderDate: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get the customer first to verify ownership
    const existingCustomer = await prisma.marahCustomer.findUnique({
      where: { id: id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
        orders: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingCustomer.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if customer has orders
    if (existingCustomer.orders.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete customer with existing orders. Consider marking them as inactive instead.' 
      }, { status: 400 });
    }

    // Delete customer addresses first
    await prisma.marahCustomerAddress.deleteMany({
      where: { customerId: id },
    });

    // Delete the customer
    await prisma.marahCustomer.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}

export const GET = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(getHandler);
export const PUT = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(putHandler);
export const DELETE = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(deleteHandler); 