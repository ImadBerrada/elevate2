import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ApplianceSchema = z.object({
  propertyId: z.string(),
  name: z.string().min(1, 'Name is required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  warrantyExpiry: z.string().optional(),
  installationDate: z.string().optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEEDS_REPLACEMENT']).default('GOOD'),
  category: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const condition = searchParams.get('condition');
    const category = searchParams.get('category');

    const whereClause: any = {};
    
    if (propertyId && propertyId !== 'all') {
      whereClause.propertyId = propertyId;
    }
    
    // Note: category and location aren't in the Prisma schema, 
    // but we'll extend the notes field to include JSON data for these
    
    const appliances = await prisma.propertyAppliance.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            propertyType: true,
          },
        },
      },
      orderBy: [
        { condition: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Parse notes JSON to extract category and location
    const enrichedAppliances = appliances.map(appliance => {
      let additionalData = {};
      try {
        if (appliance.notes) {
          additionalData = JSON.parse(appliance.notes);
        }
      } catch (e) {
        // Notes is just text, not JSON
      }
      
      return {
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
    });

    // Apply additional filters
    let filteredAppliances = enrichedAppliances;
    
    if (condition && condition !== 'all') {
      filteredAppliances = filteredAppliances.filter(app => 
        app.condition.toLowerCase() === condition.toLowerCase()
      );
    }
    
    if (category && category !== 'all') {
      filteredAppliances = filteredAppliances.filter(app => 
        app.category.toLowerCase() === category.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      appliances: filteredAppliances,
    });
  } catch (error) {
    console.error('Failed to fetch appliances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appliances' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ApplianceSchema.parse(body);

    // Create additional data object for notes
    const additionalData = {
      category: validatedData.category,
      location: validatedData.location,
      lastMaintenance: null,
      nextMaintenance: null,
    };

    const appliance = await prisma.propertyAppliance.create({
      data: {
        propertyId: validatedData.propertyId,
        name: validatedData.name,
        brand: validatedData.brand,
        model: validatedData.model,
        serialNumber: validatedData.serialNumber,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
        purchasePrice: validatedData.purchasePrice,
        warrantyExpiry: validatedData.warrantyExpiry ? new Date(validatedData.warrantyExpiry) : null,
        installationDate: validatedData.installationDate ? new Date(validatedData.installationDate) : null,
        condition: validatedData.condition,
        notes: JSON.stringify(additionalData),
      },
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
      appliance,
    });
  } catch (error) {
    console.error('Failed to create appliance:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create appliance' },
      { status: 500 }
    );
  }
} 