import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { activitySchema } from '@/lib/validations';

// GET /api/activities - Get activities (demo mode - no auth required)
export async function GET(request: NextRequest) {
  try {
    // For demo purposes, use default user ID
    const userId = 'demo-user-id';
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const where = {
      userId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { notes: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        type: true,
        date: true,
        notes: true,
        points: true,
        createdAt: true,
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create activity (demo mode - no auth required)
export async function POST(request: NextRequest) {
  try {
    // For demo purposes, use default user ID
    const userId = 'demo-user-id';
    
    const body = await request.json();
    const validatedData = activitySchema.parse(body);

    // Calculate points based on activity type
    const pointsMap = {
      MEETING: 10,
      CALL: 5,
      EMAIL: 3,
      NETWORKING: 15,
      PRESENTATION: 20,
      NEGOTIATION: 25,
      PARTNERSHIP: 30,
      DEAL: 50,
    };
    
    const points = pointsMap[validatedData.type] || 0;

    const activity = await prisma.activity.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        points,
        userId,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
} 