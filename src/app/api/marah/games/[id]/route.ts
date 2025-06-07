import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const updateGameSchema = z.object({
  nameEn: z.string().min(1, 'English name is required').optional(),
  nameAr: z.string().min(1, 'Arabic name is required').optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required').optional(),
  pricePerDay: z.number().positive('Price must be positive').optional(),
  pricePerWeek: z.number().positive('Price must be positive').optional(),
  pricePerMonth: z.number().positive('Price must be positive').optional(),
  isDiscountable: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  imageUrl: z.string().optional(),
  dimensions: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  ageGroup: z.string().optional(),
  setupTime: z.number().int().positive().optional(),
});

async function getHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const game = await prisma.marahGame.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
        orderItems: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                eventDate: true,
                eventEndDate: true,
              },
            },
          },
          orderBy: {
            order: {
              eventDate: 'desc',
            },
          },
          take: 10,
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (game.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

async function putHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateGameSchema.parse(body);

    // Get the game first to verify ownership
    const existingGame = await prisma.marahGame.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingGame.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the game
    const updatedGame = await prisma.marahGame.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedGame);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the game first to verify ownership
    const existingGame = await prisma.marahGame.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
        orderItems: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Verify company belongs to user
    if (existingGame.company.userId !== request.user!.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if game is used in any orders
    if (existingGame.orderItems.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete game that has been used in orders. Consider marking it as unavailable instead.' 
      }, { status: 400 });
    }

    // Delete the game
    await prisma.marahGame.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler); 