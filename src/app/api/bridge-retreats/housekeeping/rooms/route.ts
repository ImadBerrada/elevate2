import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    const rooms = await prisma.facilityRoom.findMany({
      where: facilityId ? { facilityId } : {},
      include: {
        facility: {
          select: {
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        roomNumber: 'asc'
      }
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      facilityId,
      roomNumber,
      roomType,
      capacity,
      bedType,
      hasPrivateBath,
      hasBalcony,
      hasAC,
      hasWifi,
      assignedHousekeeper
    } = body;

    const room = await prisma.facilityRoom.create({
      data: {
        facilityId,
        roomNumber,
        roomType,
        capacity,
        currentOccupancy: 0,
        bedType,
        hasPrivateBath: hasPrivateBath || false,
        hasBalcony: hasBalcony || false,
        hasAC: hasAC || false,
        hasWifi: hasWifi || false,
        assignedHousekeeper,
        status: 'AVAILABLE',
        cleaningStatus: 'CLEAN'
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

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
} 