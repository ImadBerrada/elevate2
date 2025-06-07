import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const deliveryChargeSchema = z.object({
  zone: z.string().min(1, 'Zone is required'),
  area: z.string().optional(),
  charge: z.number().positive().optional(), // For backward compatibility
  baseCharge: z.number().positive().optional(),
  perKmCharge: z.number().positive().optional(),
  minimumCharge: z.number().positive().optional(),
  maximumCharge: z.number().positive().optional(),
  estimatedTime: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
}).refine(data => data.charge || (data.baseCharge && data.perKmCharge && data.minimumCharge), {
  message: 'Either charge or (baseCharge, perKmCharge, minimumCharge) must be provided',
});

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const zone = searchParams.get('zone');
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Verify company belongs to user
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        userId: request.user!.userId,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const where: any = { companyId };

    if (search) {
      where.OR = [
        { zone: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (zone && zone !== 'all') {
      where.zone = zone;
    }

    if (status) {
      switch (status) {
        case 'active':
          where.isActive = true;
          break;
        case 'inactive':
          where.isActive = false;
          break;
      }
    }

    const [deliveryCharges, total] = await Promise.all([
      prisma.marahDeliveryCharge.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.marahDeliveryCharge.count({ where }),
    ]);

    // Convert Decimal to number for JSON serialization
    const deliveryChargesWithNumbers = deliveryCharges.map(charge => ({
      ...charge,
      baseCharge: Number(charge.baseCharge),
      perKmCharge: Number(charge.perKmCharge),
      minimumCharge: Number(charge.minimumCharge),
      maximumCharge: charge.maximumCharge ? Number(charge.maximumCharge) : undefined,
    }));

    return NextResponse.json({
      deliveryCharges: deliveryChargesWithNumbers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching delivery charges:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery charges' }, { status: 500 });
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = deliveryChargeSchema.parse(body);

    // Verify company belongs to user
    const company = await prisma.company.findFirst({
      where: {
        id: validatedData.companyId,
        userId: request.user!.userId,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check if zone already exists for this company
    const existingCharge = await prisma.marahDeliveryCharge.findFirst({
      where: {
        zone: validatedData.zone,
        companyId: validatedData.companyId,
      },
    });

    if (existingCharge) {
      return NextResponse.json({ error: 'Delivery charge for this zone already exists' }, { status: 400 });
    }

    const deliveryCharge = await prisma.marahDeliveryCharge.create({
      data: validatedData,
    });

    // Convert Decimal to number for JSON serialization
    const deliveryChargeWithNumbers = {
      ...deliveryCharge,
      baseCharge: Number(deliveryCharge.baseCharge),
      perKmCharge: Number(deliveryCharge.perKmCharge),
      minimumCharge: Number(deliveryCharge.minimumCharge),
      maximumCharge: deliveryCharge.maximumCharge ? Number(deliveryCharge.maximumCharge) : undefined,
    };

    return NextResponse.json(deliveryChargeWithNumbers, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error creating delivery charge:', error);
    return NextResponse.json({ error: 'Failed to create delivery charge' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler); 