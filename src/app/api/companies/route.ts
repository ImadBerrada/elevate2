import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { z } from 'zod';

// Validation schema for company creation
const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
  industry: z.string().min(1, 'Industry is required'),
  size: z.string().min(1, 'Company size is required'),
  location: z.string().min(1, 'Location is required'),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  revenue: z.string().optional(),
  logo: z.string().optional(),
  tradeLicenseNumber: z.string().optional(),
  tradeLicenseExpiry: z.string().optional().transform(val => val ? new Date(val) : undefined),
  tradeLicenseDocument: z.string().optional(),
});

// GET /api/companies - List companies with filtering and pagination
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || '';
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
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (industry) {
      where.industry = industry;
    }

    if (status) {
      where.status = status;
    }

    // Get companies with employee count
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          employees: {
            select: { id: true },
          },
          _count: {
            select: { employees: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]);

    // Transform data to include employee count
    const companiesWithCount = companies.map(company => ({
      ...company,
      employeeCount: company._count.employees,
      employees: undefined,
      _count: undefined,
    }));

    return NextResponse.json({
      companies: companiesWithCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
});

// POST /api/companies - Create a new company
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    // Check if company with same name already exists for this user
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: validatedData.name,
        userId: request.user!.userId,
      },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 400 }
      );
    }

    // Create the company
    const company = await prisma.company.create({
      data: {
        ...validatedData,
        userId: request.user!.userId,
      },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    // Transform response
    const companyWithCount = {
      ...company,
      employeeCount: company._count.employees,
      _count: undefined,
    };

    return NextResponse.json(companyWithCount, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}); 