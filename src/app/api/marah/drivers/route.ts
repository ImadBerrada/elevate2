import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { verifyCompanyAccess, getAccessibleCompanyIds } from '@/lib/company-access';

const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Valid email is required').optional(),
  
  // Driver-specific fields that exist in MarahDriver model
  licenseNumber: z.string().optional(),
  vehicleInfo: z.string().optional(),
  vehicleRegistration: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BUSY']).default('ACTIVE'),
  profilePicture: z.string().optional(),
  dateOfBirth: z.string().optional().transform(val => val ? new Date(val) : undefined),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  experience: z.string().optional(),
  salary: z.number().optional().transform(val => val ? val : undefined),
  licenseDocument: z.string().optional(),
  vehicleDocument: z.string().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
  
  // Employee fields that we'll use to create Employee record
  department: z.string().min(1, 'Department is required'),
  startDate: z.string().min(1, 'Start date is required'),
  role: z.string().min(1, 'Role is required'),
  employerId: z.string().optional(),
  actualSalary: z.string().optional(),
  location: z.string().optional(),
  manager: z.string().optional(),
  skills: z.array(z.string()).default([]),
  employeeStatus: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).optional(),
});

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause based on user role and permissions
    const where: any = {};

    if (companyId) {
      // Verify user has access to this specific company
      const hasAccess = await verifyCompanyAccess(request.user!.userId, request.user!.role, companyId);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Company access denied' }, { status: 403 });
      }
      where.companyId = companyId;
    } else {
      // Get all accessible companies for this user
      const accessibleCompanyIds = await getAccessibleCompanyIds(request.user!.userId, request.user!.role);
      
      if (accessibleCompanyIds.length === 0) {
        return NextResponse.json({ 
          drivers: [], 
          pagination: { page, limit, total: 0, pages: 0 } 
        });
      }
      
      where.companyId = { in: accessibleCompanyIds };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [drivers, total] = await Promise.all([
      prisma.marahDriver.findMany({
        where,
        include: {
          orders: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              orderDate: true,
              eventDate: true,
            },
            orderBy: { orderDate: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.marahDriver.count({ where }),
    ]);

    // Calculate driver statistics
    const driversWithStats = drivers.map(driver => {
      const totalOrders = driver.orders.length;
      const completedOrders = driver.orders.filter(order => order.status === 'COMPLETED').length;
      const activeOrders = driver.orders.filter(order => 
        ['ASSIGNED', 'DELIVERED', 'ACTIVE'].includes(order.status)
      ).length;
      const totalRevenue = driver.orders
        .filter(order => order.status === 'COMPLETED')
        .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

      return {
        ...driver,
        totalOrders,
        completedOrders,
        activeOrders,
        totalRevenue,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      };
    });

    return NextResponse.json({
      drivers: driversWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = driverSchema.parse(body);

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(request.user!.userId, request.user!.role, validatedData.companyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Company access denied' }, { status: 403 });
    }

    // Check if phone number already exists for driver
    const existingDriver = await prisma.marahDriver.findFirst({
      where: {
        phone: validatedData.phone,
      },
    });

    if (existingDriver) {
      return NextResponse.json({ 
        error: 'Phone number already exists', 
        message: `A driver with phone number ${validatedData.phone} already exists. Please use a different phone number.` 
      }, { status: 409 });
    }

    // Check if email already exists for employee (if email is provided)
    // Skip this check if we're creating a driver from an existing employee (indicated by employee fields being present)
    const isCreatingFromEmployee = validatedData.department && validatedData.startDate && validatedData.role;
    
    if (validatedData.email && !isCreatingFromEmployee) {
      const existingEmployee = await prisma.employee.findFirst({
        where: {
          email: validatedData.email,
        },
      });

      if (existingEmployee) {
        return NextResponse.json({ 
          error: 'Email already exists', 
          message: `An employee with email ${validatedData.email} already exists. Please use a different email.` 
        }, { status: 409 });
      }
    }

    // Use transaction to create driver and optionally employee records
    const result = await prisma.$transaction(async (tx) => {
      // Extract driver-specific fields
      const {
        department, startDate, role, employerId, actualSalary, location, manager, skills, employeeStatus,
        name, ...driverData
      } = validatedData;

      // Create the driver record
      const driver = await tx.marahDriver.create({
        data: {
          ...driverData,
          name,
          email: driverData.email || null,
          totalOrders: 0,
          completedOrders: 0,
          activeOrders: 0,
          totalRevenue: 0,
          completionRate: 0,
          rating: 0,
          totalRatings: 0,
        },
      });

      let employee = null;
      
      // Only create employee if we're not creating from an existing employee
      if (!isCreatingFromEmployee) {
        employee = await tx.employee.create({
          data: {
            firstName: name.split(' ')[0] || name,
            lastName: name.split(' ').slice(1).join(' ') || '',
            email: validatedData.email || '',
            phone: validatedData.phone,
            position: role,
            department: department,
            salary: validatedData.salary?.toString() || null,
            actualSalary: actualSalary || null,
            startDate: new Date(startDate),
            status: employeeStatus || 'ACTIVE',
            location: location || null,
            manager: manager || null,
            skills: skills,
            avatar: validatedData.profilePicture || null,
            companyId: validatedData.companyId,
            userId: request.user!.userId,
          },
        });
      } else {
        // If creating from existing employee, find the existing employee
        employee = await tx.employee.findFirst({
          where: {
            email: validatedData.email,
            companyId: validatedData.companyId,
          },
        });
      }

      return { driver, employee };
    });

    const message = isCreatingFromEmployee 
      ? 'Driver created successfully from existing employee'
      : 'Driver created successfully and added to employee management';

    return NextResponse.json({
      driver: result.driver,
      employee: result.employee,
      message
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    
    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const field = (error as any).meta?.target?.[0] || 'field';
      return NextResponse.json({ 
        error: `${field} already exists`, 
        message: `A driver with this ${field} already exists. Please use a different ${field}.` 
      }, { status: 409 });
    }
    
    console.error('Error creating driver:', error);
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 });
  }
}

export const GET = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(getHandler);
export const POST = withRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])(postHandler); 