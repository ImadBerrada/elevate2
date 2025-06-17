import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ApplianceUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  warrantyExpiry: z.string().optional(),
  installationDate: z.string().optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEEDS_REPLACEMENT']).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;
const appliance = await prisma.propertyAppliance.findUnique({
      where: { id: id },
      include: {
        property: {
          include: {
            propertyType: true,
          },
        },
      },
    });

    if (!appliance) {
      return NextResponse.json(
        { success: false, error: 'Appliance not found' },
        { status: 404 }
      );
    }

    // Parse additional data from notes
    let additionalData = {};
    try {
      if (appliance.notes) {
        additionalData = JSON.parse(appliance.notes);
      }
    } catch (e) {
      // Notes is just text, not JSON
    }

    const enrichedAppliance = {
      ...appliance,
      category: (additionalData as any)?.category || 'General',
      location: (additionalData as any)?.location || 'Unknown',
      status: appliance.condition === 'NEEDS_REPLACEMENT' || appliance.condition === 'POOR' 
        ? 'maintenance' 
        : 'operational',
      lastMaintenance: (additionalData as any)?.lastMaintenance || null,
      nextMaintenance: (additionalData as any)?.nextMaintenance || null,
      value: appliance.purchasePrice || 0,
    };

    return NextResponse.json({
      success: true,
      appliance: enrichedAppliance,
    });
  } catch (error) {
    console.error('Failed to fetch appliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appliance' },
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
    const validatedData = ApplianceUpdateSchema.parse(body);

    // Get existing appliance to preserve notes structure
    const existingAppliance = await prisma.propertyAppliance.findUnique({
      where: { id: id },
    });

    if (!existingAppliance) {
      return NextResponse.json(
        { success: false, error: 'Appliance not found' },
        { status: 404 }
      );
    }

    // Parse existing additional data
    let additionalData = {};
    try {
      if (existingAppliance.notes) {
        additionalData = JSON.parse(existingAppliance.notes);
      }
    } catch (e) {
      // Notes is just text, not JSON
      additionalData = {};
    }

    // Update additional data with new values
    if (validatedData.category !== undefined) (additionalData as any).category = validatedData.category;
    if (validatedData.location !== undefined) (additionalData as any).location = validatedData.location;
    if (validatedData.lastMaintenance !== undefined) (additionalData as any).lastMaintenance = validatedData.lastMaintenance;
    if (validatedData.nextMaintenance !== undefined) (additionalData as any).nextMaintenance = validatedData.nextMaintenance;

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.brand !== undefined) updateData.brand = validatedData.brand;
    if (validatedData.model !== undefined) updateData.model = validatedData.model;
    if (validatedData.serialNumber !== undefined) updateData.serialNumber = validatedData.serialNumber;
    if (validatedData.purchaseDate !== undefined) updateData.purchaseDate = validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null;
    if (validatedData.purchasePrice !== undefined) updateData.purchasePrice = validatedData.purchasePrice;
    if (validatedData.warrantyExpiry !== undefined) updateData.warrantyExpiry = validatedData.warrantyExpiry ? new Date(validatedData.warrantyExpiry) : null;
    if (validatedData.installationDate !== undefined) updateData.installationDate = validatedData.installationDate ? new Date(validatedData.installationDate) : null;
    if (validatedData.condition !== undefined) updateData.condition = validatedData.condition;
    
    // Always update notes with the merged additional data
    updateData.notes = JSON.stringify(additionalData);

    const updatedAppliance = await prisma.propertyAppliance.update({
      where: { id: id },
      data: updateData,
      include: {
        property: {
          include: {
            propertyType: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      appliance: updatedAppliance,
    });
  } catch (error) {
    console.error('Failed to update appliance:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update appliance' },
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
    await prisma.propertyAppliance.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Appliance deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete appliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete appliance' },
      { status: 500 }
    );
  }
} 