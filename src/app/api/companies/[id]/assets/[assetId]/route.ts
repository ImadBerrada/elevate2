import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const updateAssetSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  assetTypeId: z.string().min(1, 'Asset type is required').optional(),
  purchaseValue: z.number().min(0).optional(),
  purchaseDate: z.string().transform(val => new Date(val)).optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).optional(),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  description: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  documents: z.array(z.string()).optional(),
});

const calculateCurrentValue = (purchaseValue: number, purchaseDate: Date, depreciationRate: number) => {
  const now = new Date();
  const yearsElapsed = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const depreciation = purchaseValue * (depreciationRate / 100) * yearsElapsed;
  return Math.max(0, purchaseValue - depreciation);
};

async function handler(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const { id: companyId, assetId } = await params;
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

  // Verify asset belongs to company
  const asset = await prisma.companyAsset.findFirst({
    where: {
      id: assetId,
      companyId: companyId,
    },
    include: {
      assetType: true,
    },
  });

  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  if (request.method === 'GET') {
    try {
      const currentValue = calculateCurrentValue(
        asset.purchaseValue,
        asset.purchaseDate,
        asset.assetType.depreciationRate
      );

      return NextResponse.json({
        ...asset,
        currentValue,
      });
    } catch (error) {
      console.error('Error fetching asset:', error);
      return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 });
    }
  }

  if (request.method === 'PUT') {
    try {
      const body = await request.json();
      const validatedData = updateAssetSchema.parse(body);

      // If asset type is being changed, verify it belongs to user
      let assetType = asset.assetType;
      if (validatedData.assetTypeId && validatedData.assetTypeId !== asset.assetTypeId) {
        const newAssetType = await prisma.assetType.findFirst({
          where: {
            id: validatedData.assetTypeId,
            userId: userId,
          },
        });

        if (!newAssetType) {
          return NextResponse.json({ error: 'Asset type not found' }, { status: 404 });
        }
        assetType = newAssetType;
      }

      // Calculate new current value
      const purchaseValue = validatedData.purchaseValue ?? asset.purchaseValue;
      const purchaseDate = validatedData.purchaseDate ?? asset.purchaseDate;
      const currentValue = calculateCurrentValue(
        purchaseValue,
        purchaseDate,
        assetType.depreciationRate
      );

      const updatedAsset = await prisma.companyAsset.update({
        where: { id: assetId },
        data: {
          ...validatedData,
          currentValue,
        },
        include: {
          assetType: true,
        },
      });

      return NextResponse.json({
        ...updatedAsset,
        currentValue,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
      }
      console.error('Error updating asset:', error);
      return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
    }
  }

  if (request.method === 'DELETE') {
    try {
      await prisma.companyAsset.delete({
        where: { id: assetId },
      });

      return NextResponse.json({ message: 'Asset deleted successfully' });
    } catch (error) {
      console.error('Error deleting asset:', error);
      return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withAuth(handler);
export const PUT = withAuth(handler);
export const DELETE = withAuth(handler); 