import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = await prisma.facilityRoom.findUnique({
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

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
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
      cleaningStatus,
      assignedStaff,
      notes,
      lastCleaned,
      nextService,
      priority
    } = body;

    const room = await prisma.facilityRoom.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(cleaningStatus && { cleaningStatus }),
        ...(assignedStaff && { assignedStaff }),
        ...(notes && { notes }),
        ...(lastCleaned && { lastCleaned: new Date(lastCleaned) }),
        ...(nextService && { nextService: new Date(nextService) }),
        ...(priority && { priority }),
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

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
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
    await prisma.facilityRoom.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
} 