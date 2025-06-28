import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facility = searchParams.get('facility');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const requests = await prisma.facilityMaintenanceRequest.findMany({
      where: {
        ...(facility && {
          facility: {
            name: { contains: facility, mode: 'insensitive' }
          }
        }),
        ...(status && { status: status.toUpperCase() as any }),
        ...(priority && { priority: priority.toUpperCase() as any }),
        ...(category && { category: category.toUpperCase() as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { assignedTo: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            location: true,
            type: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { requestDate: 'desc' }
      ]
    });

    // Transform data to match frontend interface
    const transformedRequests = requests.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      priority: request.priority.toLowerCase(),
      status: request.status.toLowerCase().replace('_', '_'),
      type: request.category.toLowerCase(),
      facility: request.facility.name,
      location: request.facility.location,
      requestedBy: request.reportedBy,
      assignedTo: request.assignedTo || '',
      vendor: request.vendor || '',
      estimatedCost: request.estimatedCost || 0,
      actualCost: request.actualCost || 0,
      createdAt: request.requestDate.toISOString(),
      scheduledDate: request.scheduledDate?.toISOString() || '',
      completedDate: request.completedDate?.toISOString() || '',
      images: request.images,
      notes: request.notes ? [request.notes] : []
    }));

    // Mock vendor data (you can create a separate vendors table later)
    const vendors = [
      {
        id: '1',
        name: 'CoolTech HVAC Services',
        contact: 'Mike Wilson',
        email: 'mike@cooltech.com',
        phone: '+1 (555) 123-4567',
        specialties: ['HVAC', 'Electrical', 'Plumbing'],
        rating: 4.8,
        totalJobs: 45,
        averageCost: 650,
        responseTime: 2,
        avatar: '/api/placeholder/40/40'
      },
      {
        id: '2',
        name: 'AquaClear Pool Services',
        contact: 'Sarah Johnson',
        email: 'sarah@aquaclear.com',
        phone: '+1 (555) 234-5678',
        specialties: ['Pool Maintenance', 'Water Systems'],
        rating: 4.6,
        totalJobs: 32,
        averageCost: 300,
        responseTime: 1,
        avatar: '/api/placeholder/40/40'
      }
    ];

    // Calculate stats
    const totalRequests = transformedRequests.length;
    const pending = transformedRequests.filter(r => r.status === 'pending').length;
    const inProgress = transformedRequests.filter(r => r.status === 'in_progress').length;
    const completed = transformedRequests.filter(r => r.status === 'completed').length;
    const totalCost = transformedRequests.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost), 0);
    const averageCost = totalRequests > 0 ? Math.round(totalCost / totalRequests) : 0;
    const averageResponseTime = 1.5; // Days - calculate from vendor data

    return NextResponse.json({
      requests: transformedRequests,
      vendors,
      stats: {
        totalRequests,
        pending,
        inProgress,
        completed,
        totalCost,
        averageCost,
        averageResponseTime,
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      facilityId,
      title,
      description,
      priority,
      category,
      assignedTo,
      scheduledDate,
      estimatedCost,
      vendor,
      reportedBy
    } = body;

    // Validate required fields
    if (!facilityId || !title || !description || !reportedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: facilityId, title, description, reportedBy' },
        { status: 400 }
      );
    }

    const maintenanceRequest = await prisma.facilityMaintenanceRequest.create({
      data: {
        facilityId,
        title,
        description,
        priority: priority?.toUpperCase() || 'MEDIUM',
        status: 'PENDING',
        category: category?.toUpperCase() || 'OTHER',
        assignedTo,
        reportedBy,
        requestDate: new Date(),
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        estimatedCost: estimatedCost || null,
        vendor,
        images: [],
        documents: []
      },
      include: {
        facility: true
      }
    });

    return NextResponse.json({ request: maintenanceRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance request' },
      { status: 500 }
    );
  }
} 