import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const MaintenanceUpdateSchema = z.object({
  type: z.enum(['Preventive', 'Corrective', 'Emergency']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'pending', 'cancelled']).optional(),
  scheduledDate: z.string().optional(),
  technician: z.string().optional(),
  estimatedDuration: z.string().optional(),
  cost: z.number().optional(),
  description: z.string().optional(),
  completedDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: id },
      include: {
        property: {
          include: {
            propertyType: true,
            appliances: true,
          },
        },
      },
    });

    if (!maintenanceRequest) {
      return NextResponse.json(
        { success: false, error: 'Maintenance task not found' },
        { status: 404 }
      );
    }

    // Parse additional data from tenantContact JSON field
    let additionalData = {};
    try {
      if (maintenanceRequest.tenantContact) {
        additionalData = maintenanceRequest.tenantContact as any;
      }
    } catch (e) {
      // tenantContact is not valid JSON
    }

    const maintenanceTask = {
      id: maintenanceRequest.id,
      applianceId: (additionalData as any)?.applianceId || null,
      appliance: (additionalData as any)?.applianceName || 'General Appliance',
      property: maintenanceRequest.property.name,
      type: (additionalData as any)?.maintenanceType || 'Corrective',
      priority: maintenanceRequest.priority.toLowerCase(),
      status: maintenanceRequest.status.toLowerCase().replace('_', '-'),
      scheduledDate: maintenanceRequest.requestDate || maintenanceRequest.createdAt.toISOString().split('T')[0],
      technician: maintenanceRequest.assignedTo || 'Unassigned',
      estimatedDuration: (additionalData as any)?.estimatedDuration || '2 hours',
      cost: Number(maintenanceRequest.estimatedCost) || 0,
      description: maintenanceRequest.description,
      completedDate: maintenanceRequest.completionDate || null,
      notes: (additionalData as any)?.originalNotes || '',
    };

    return NextResponse.json({
      success: true,
      maintenanceTask,
    });
  } catch (error) {
    console.error('Failed to fetch maintenance task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance task' },
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
    const validatedData = MaintenanceUpdateSchema.parse(body);

    // Get existing maintenance request
    const existingRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Maintenance task not found' },
        { status: 404 }
      );
    }

    // Parse existing additional data
    let additionalData = {};
    try {
      if (existingRequest.tenantContact) {
        additionalData = existingRequest.tenantContact as any;
      }
    } catch (e) {
      // tenantContact is not valid JSON
      additionalData = {};
    }

    // Update additional data with new values
    if (validatedData.type !== undefined) (additionalData as any).maintenanceType = validatedData.type;
    if (validatedData.estimatedDuration !== undefined) (additionalData as any).estimatedDuration = validatedData.estimatedDuration;
    if (validatedData.notes !== undefined) (additionalData as any).originalNotes = validatedData.notes;

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority.toUpperCase();
    if (validatedData.status !== undefined) updateData.status = validatedData.status.toUpperCase().replace('-', '_');
    if (validatedData.scheduledDate !== undefined) updateData.requestDate = validatedData.scheduledDate;
    if (validatedData.technician !== undefined) updateData.assignedTo = validatedData.technician;
    if (validatedData.cost !== undefined) updateData.estimatedCost = validatedData.cost;
    if (validatedData.completedDate !== undefined) updateData.completionDate = validatedData.completedDate;
    
    // Always update tenantContact with the merged additional data
    updateData.tenantContact = additionalData;

    const updatedRequest = await prisma.maintenanceRequest.update({
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
      maintenanceTask: updatedRequest,
    });
  } catch (error) {
    console.error('Failed to update maintenance task:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update maintenance task' },
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
    await prisma.maintenanceRequest.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Maintenance task deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete maintenance task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete maintenance task' },
      { status: 500 }
    );
  }
} 