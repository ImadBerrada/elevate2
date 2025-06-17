import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const MaintenanceTaskSchema = z.object({
  applianceId: z.string(),
  propertyId: z.string(),
  type: z.enum(['Preventive', 'Corrective', 'Emergency']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'pending', 'cancelled']),
  scheduledDate: z.string(),
  technician: z.string().optional(),
  estimatedDuration: z.string().optional(),
  cost: z.number().optional(),
  description: z.string(),
  completedDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applianceId = searchParams.get('applianceId');
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');

    // Use maintenance requests as base for appliance maintenance
    const whereClause: any = {
      category: 'APPLIANCE'
    };
    
    if (propertyId && propertyId !== 'all') {
      whereClause.propertyId = propertyId;
    }
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    
    if (priority && priority !== 'all') {
      whereClause.priority = priority.toUpperCase();
    }

    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            propertyType: true,
            appliances: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Transform maintenance requests to match appliance maintenance format
    const maintenanceTasks = maintenanceRequests.map(request => {
      // Parse tenantContact to get additional maintenance data
      let additionalData = {};
      try {
        if (request.tenantContact) {
          additionalData = request.tenantContact as any;
        }
      } catch (e) {
        // tenantContact is not valid JSON
      }

      return {
        id: request.id,
        applianceId: (additionalData as any)?.applianceId || null,
        appliance: (additionalData as any)?.applianceName || 'General Appliance',
        property: request.property.name,
        type: (additionalData as any)?.maintenanceType || 'Corrective',
        priority: request.priority.toLowerCase(),
        status: request.status.toLowerCase().replace('_', '-'),
        scheduledDate: request.requestDate || request.createdAt.toISOString().split('T')[0],
        technician: request.assignedTo || 'Unassigned',
        estimatedDuration: (additionalData as any)?.estimatedDuration || '2 hours',
        cost: Number(request.estimatedCost) || 0,
        description: request.description,
        completedDate: request.completionDate || null,
        notes: (additionalData as any)?.originalNotes || '',
      };
    });

    // Filter by appliance if specified
    let filteredTasks = maintenanceTasks;
    if (applianceId && applianceId !== 'all') {
      filteredTasks = maintenanceTasks.filter(task => task.applianceId === applianceId);
    }

    // Filter by type if specified
    if (type && type !== 'all') {
      filteredTasks = filteredTasks.filter(task => 
        task.type.toLowerCase() === type.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      maintenanceTasks: filteredTasks,
    });
  } catch (error) {
    console.error('Failed to fetch maintenance tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = MaintenanceTaskSchema.parse(body);

    // Get appliance details
    const appliance = await prisma.propertyAppliance.findUnique({
      where: { id: validatedData.applianceId },
      include: { property: true },
    });

    if (!appliance) {
      return NextResponse.json(
        { success: false, error: 'Appliance not found' },
        { status: 404 }
      );
    }

    // Create additional data for notes
    const additionalData = {
      applianceId: validatedData.applianceId,
      applianceName: `${appliance.name} - ${appliance.brand} ${appliance.model}`,
      maintenanceType: validatedData.type,
      estimatedDuration: validatedData.estimatedDuration,
    };

    // Create maintenance request
    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        propertyId: validatedData.propertyId,
        title: `${validatedData.type} Maintenance - ${appliance.name}`,
        description: validatedData.description,
        priority: validatedData.priority.toUpperCase() as any,
        category: 'APPLIANCE',
        status: validatedData.status.toUpperCase().replace('-', '_') as any,
        requestDate: validatedData.scheduledDate,
        estimatedCost: validatedData.cost || 0,
        assignedTo: validatedData.technician,
        tenantContact: {
          ...additionalData,
          originalNotes: validatedData.notes,
        },
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
      maintenanceTask: maintenanceRequest,
    });
  } catch (error) {
    console.error('Failed to create maintenance task:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create maintenance task' },
      { status: 500 }
    );
  }
} 