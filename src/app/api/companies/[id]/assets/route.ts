import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const assetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  assetTypeId: z.string().min(1, 'Asset type is required'),
  purchaseValue: z.number().min(0),
  purchaseDate: z.string().transform(val => new Date(val)),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).default('GOOD'),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  description: z.string().optional(),
  customFields: z.record(z.any()).optional().default({}),
  documents: z.array(z.string()).optional().default([]),
});

const calculateCurrentValue = (purchaseValue: number, purchaseDate: Date, depreciationRate: number) => {
  const now = new Date();
  const yearsElapsed = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const depreciation = purchaseValue * (depreciationRate / 100) * yearsElapsed;
  return Math.max(0, purchaseValue - depreciation);
};

async function handler(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  
  const { id } = await params;const { id: companyId } = await params;
  const userId = request.user!.userId;

  // Verify company belongs to user
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      userId: userId,
    },
  });

  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  if (request.method === 'GET') {
    try {
      const assets = await prisma.companyAsset.findMany({
        where: { companyId },
        include: {
          assetType: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate current values
      const assetsWithCurrentValue = assets.map(asset => ({
        ...asset,
        currentValue: calculateCurrentValue(
          asset.purchaseValue,
          asset.purchaseDate,
          asset.assetType.depreciationRate
        ),
      }));

      return NextResponse.json(assetsWithCurrentValue);
    } catch (error) {
      console.error('Error fetching assets:', error);
      return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const validatedData = assetSchema.parse(body);

      // Get asset type to calculate current value
      const assetType = await prisma.assetType.findFirst({
        where: {
          id: validatedData.assetTypeId,
          userId: userId,
        },
      });

      if (!assetType) {
        return NextResponse.json({ error: 'Asset type not found' }, { status: 404 });
      }

      const currentValue = calculateCurrentValue(
        validatedData.purchaseValue,
        validatedData.purchaseDate,
        assetType.depreciationRate
      );

      const asset = await prisma.companyAsset.create({
        data: {
          ...validatedData,
          currentValue,
          companyId,
        },
        include: {
          assetType: true,
        },
      });

      return NextResponse.json(asset, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
      }
      console.error('Error creating asset:', error);
      return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withAuth(handler);
export const POST = withAuth(handler); 