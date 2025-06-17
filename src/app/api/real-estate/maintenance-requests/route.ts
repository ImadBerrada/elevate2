import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const MaintenanceRequestSchema = z.object({
  propertyId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  category: z.enum(['PLUMBING', 'ELECTRICAL', 'HVAC', 'CLEANING', 'PAINTING', 'APPLIANCE', 'SECURITY', 'OTHER']),
  unitNumber: z.string().optional(),
  estimatedCost: z.number().positive().optional(),
  assignedTo: z.string().optional(),
  tenantContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const whereClause: any = {};
    
    if (propertyId) {
      whereClause.propertyId = propertyId;
    }
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    
    if (priority && priority !== 'all') {
      whereClause.priority = priority.toUpperCase();
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            owner: true,
            propertyType: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Failed to fetch maintenance requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating maintenance request with data:', body);

    const validatedData = MaintenanceRequestSchema.parse(body);

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        propertyId: validatedData.propertyId,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        status: 'PENDING',
        category: validatedData.category,
        unitNumber: validatedData.unitNumber,
        estimatedCost: validatedData.estimatedCost,
        assignedTo: validatedData.assignedTo,
        requestDate: new Date().toISOString(),
        tenantContact: validatedData.tenantContact ? {
          name: validatedData.tenantContact.name,
          phone: validatedData.tenantContact.phone,
          email: validatedData.tenantContact.email,
        } : undefined,
      },
      include: {
        property: {
          include: {
            owner: true,
            propertyType: true,
          },
        },
      },
    });

    console.log('Maintenance request created successfully:', maintenanceRequest.id);

    return NextResponse.json({
      success: true,
      request: maintenanceRequest,
    });
  } catch (error) {
    console.error('Failed to create maintenance request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create maintenance request' },
      { status: 500 }
    );
  }
} 