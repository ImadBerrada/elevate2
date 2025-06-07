import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { z } from 'zod';

// Validation schema for employee creation
const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),

  department: z.string().min(1, 'Department is required'),
  role: z.string().min(1, 'Role is required'),
  companyId: z.string().min(1, 'Company is required'),
  actualCompanyId: z.string().optional(),
  salary: z.string().optional(),
  actualSalary: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required').transform((str) => new Date(str)),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).default('ACTIVE'),
  location: z.string().optional(),
  manager: z.string().optional(),
  skills: z.array(z.string()).default([]),
  avatar: z.string().optional(),
});

// GET /api/employees - List employees with filtering and pagination
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const companyId = searchParams.get('companyId') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {
      userId: request.user!.userId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }

    // Get employees with company information
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
          actualCompany: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
          visa: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    // Transform data to include company name and map position to role
    const employeesWithCompany = employees.map(employee => ({
      ...employee,
      role: employee.position, // Map position to role for frontend
      companyName: employee.company.name,
      actualCompanyName: employee.actualCompany?.name || null,
    }));

    return NextResponse.json({
      employees: employeesWithCompany,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
});

// POST /api/employees - Create a new employee
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    
    // Transform skills from comma-separated string to array if needed
    if (typeof body.skills === 'string') {
      body.skills = body.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean);
    }

    // Remove fields that don't exist in the database schema
    const { employerId, ...cleanBody } = body;

    const validatedData = createEmployeeSchema.parse(cleanBody);

    // Check if employee email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      );
    }

    // Verify that the company exists and belongs to the user
    const company = await prisma.company.findFirst({
      where: {
        id: validatedData.companyId,
        userId: request.user!.userId,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found or access denied' },
        { status: 400 }
      );
    }

    // Verify actual company if provided
    let actualCompany = null;
    if (validatedData.actualCompanyId) {
      actualCompany = await prisma.company.findFirst({
        where: {
          id: validatedData.actualCompanyId,
          userId: request.user!.userId,
        },
      });

      if (!actualCompany) {
        return NextResponse.json(
          { error: 'Actual company not found or access denied' },
          { status: 400 }
        );
      }
    }

    // Create the employee
    const { role, ...employeeData } = validatedData;
    const employee = await prisma.employee.create({
      data: {
        ...employeeData,
        position: role, // Map role to position for database
        userId: request.user!.userId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
        actualCompany: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
      },
    });

    // Update company employee count
    await prisma.company.update({
      where: { id: validatedData.companyId },
      data: {
        employeeCount: {
          increment: 1,
        },
      },
    });

    // Transform response and map position to role
    const employeeWithCompany = {
      ...employee,
      role: employee.position, // Map position to role for frontend
      companyName: employee.company.name,
      actualCompanyName: employee.actualCompany?.name || null,
    };

    return NextResponse.json(employeeWithCompany, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError?.message || 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}); 