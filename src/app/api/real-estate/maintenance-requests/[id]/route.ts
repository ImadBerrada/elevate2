import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateMaintenanceRequestSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  category: z.enum(['PLUMBING', 'ELECTRICAL', 'HVAC', 'CLEANING', 'PAINTING', 'APPLIANCE', 'SECURITY', 'OTHER']).optional(),
  unitNumber: z.string().optional(),
  estimatedCost: z.number().positive().optional(),
  actualCost: z.number().positive().optional(),
  assignedTo: z.string().optional(),
  completionDate: z.string().optional(),
  tenantContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;
const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: id },
      include: {
        property: {
          include: {
            owner: true,
            propertyType: true,
          },
        },
      },
    });

    if (!maintenanceRequest) {
      return NextResponse.json(
        { success: false, error: 'Maintenance request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: maintenanceRequest,
    });
  } catch (error) {
    console.error('Failed to fetch maintenance request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance request' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('Updating maintenance request:', id, 'with data:', body);

    const validatedData = UpdateMaintenanceRequestSchema.parse(body);

    // Check if maintenance request exists
    const existingRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Maintenance request not found' },
        { status: 404 }
      );
    }

    // Auto-set completion date if status is being updated to COMPLETED
    let updateData: any = { ...validatedData };
    if (validatedData.status === 'COMPLETED' && existingRequest.status !== 'COMPLETED') {
      updateData.completionDate = new Date().toISOString();
    }

    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: id },
      data: updateData,
      include: {
        property: {
          include: {
            owner: true,
            propertyType: true,
          },
        },
      },
    });

    console.log('Maintenance request updated successfully:', updatedRequest.id);

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Failed to update maintenance request:', error);
    
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
      { success: false, error: 'Failed to update maintenance request' },
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
    // Check if maintenance request exists
    const existingRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Maintenance request not found' },
        { status: 404 }
      );
    }

    await prisma.maintenanceRequest.delete({
      where: { id: id },
    });

    console.log('Maintenance request deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Maintenance request deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete maintenance request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete maintenance request' },
      { status: 500 }
    );
  }
} 