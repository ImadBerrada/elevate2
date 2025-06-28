import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workOrder = await prisma.facilityMaintenanceRequest.findUnique({
      where: { id },
      include: {
        facility: {
          select: {
            name: true,
            type: true
          }
        }
      }
    });

    if (!workOrder) {
      return NextResponse.json(
        { error: 'Work order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ workOrder });
  } catch (error) {
    console.error('Error fetching work order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      status,
      priority,
      assignedTo,
      vendor,
      actualCost,
      actualTime,
      completedDate,
      notes,
      scheduledDate
    } = body;

    const workOrder = await prisma.facilityMaintenanceRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo && { assignedTo }),
        ...(vendor && { vendor }),
        ...(actualCost && { actualCost: parseFloat(actualCost) }),
        ...(actualTime && { actualTime: parseInt(actualTime) }),
        ...(completedDate && { completedDate: new Date(completedDate) }),
        ...(notes && { notes }),
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        updatedAt: new Date()
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

    return NextResponse.json({ workOrder });
  } catch (error) {
    console.error('Error updating work order:', error);
    return NextResponse.json(
      { error: 'Failed to update work order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.facilityMaintenanceRequest.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Work order deleted successfully' });
  } catch (error) {
    console.error('Error deleting work order:', error);
    return NextResponse.json(
      { error: 'Failed to delete work order' },
      { status: 500 }
    );
  }
} 