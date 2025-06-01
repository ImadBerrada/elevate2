import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { activitySchema } from '@/lib/validations';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

// GET /api/activities - Get all activities for the authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const activities = await prisma.activity.findMany({
      where: { userId: request.user!.userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.activity.count({
      where: { userId: request.user!.userId },
    });

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
});

// POST /api/activities - Create a new activity
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    
    // Validate input
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
    
    // Create activity
    const activity = await prisma.activity.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        points,
        userId: request.user!.userId,
      },
    });
    
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Create activity error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}); 