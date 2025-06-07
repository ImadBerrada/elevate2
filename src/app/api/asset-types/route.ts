import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const assetTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  depreciationRate: z.number().min(0).max(100),
  description: z.string().optional(),
  fields: z.record(z.any()).optional().default({}),
});

async function handler(request: AuthenticatedRequest) {
  const userId = request.user!.userId;

  if (request.method === 'GET') {
    try {
      const assetTypes = await prisma.assetType.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
      });

      return NextResponse.json(assetTypes);
    } catch (error) {
      console.error('Error fetching asset types:', error);
      return NextResponse.json({ error: 'Failed to fetch asset types' }, { status: 500 });
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const validatedData = assetTypeSchema.parse(body);

      const assetType = await prisma.assetType.create({
        data: {
          ...validatedData,
          userId,
        },
      });

      return NextResponse.json(assetType, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
      }
      console.error('Error creating asset type:', error);
      return NextResponse.json({ error: 'Failed to create asset type' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withAuth(handler);
export const POST = withAuth(handler); 