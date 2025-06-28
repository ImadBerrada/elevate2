import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    const workOrders = await prisma.facilityMaintenanceRequest.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
        ...(category && { category: category as any })
      },
      include: {
        facility: {
          select: {
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ workOrders });
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      facilityId,
      title,
      description,
      category,
      priority,

      reportedBy,
      estimatedCost,

      scheduledDate,
      assignedTo,
      vendor
    } = body;

    const workOrder = await prisma.facilityMaintenanceRequest.create({
      data: {
        facilityId,
        title,
        description,
        category,
        priority: priority || 'MEDIUM',

        reportedBy,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,

        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        assignedTo,
        vendor,
        status: 'PENDING'
      },
      include: {
        facility: {
          select: {
            name: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json({ workOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating work order:', error);
    return NextResponse.json(
      { error: 'Failed to create work order' },
      { status: 500 }
    );
  }
} 