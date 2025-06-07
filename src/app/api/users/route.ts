import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { userSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

// GET /api/users - Get all users (Admin only)
export const GET = withRole(['ADMIN', 'SUPER_ADMIN'])(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Add search filter
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    // Add role filter - map frontend roles to database roles
    if (role && role !== 'ALL') {
      if (role === 'MANAGER') {
        // Since MANAGER doesn't exist in DB, we'll treat it as ADMIN for now
        whereClause.role = 'ADMIN';
      } else if (role === 'VIEWER') {
        // Since VIEWER doesn't exist in DB, we'll treat it as USER for now
        whereClause.role = 'USER';
      } else {
        whereClause.role = role;
      }
    }

    // Add status filter (we'll map this to active/inactive based on updatedAt for now)
    // Since the current schema doesn't have a status field, we'll simulate it

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.user.count({
      where: whereClause,
    });

    // Transform users to match frontend expectations
    const transformedUsers = users.map(user => ({
      ...user,
      phone: '', // Default empty since not in schema yet
      status: 'ACTIVE', // Default to active for now
      company: '',
      department: '',
      position: '',
      location: '',
      lastLogin: user.updatedAt.toISOString(), // Use updatedAt as lastLogin for now
      // Map database roles to frontend roles
      role: user.role === 'SUPER_ADMIN' ? 'ADMIN' : user.role,
    }));

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});

// POST /api/users - Create a new user (Admin only)
export const POST = withRole(['ADMIN', 'SUPER_ADMIN'])(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = userSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Create user (only using fields that exist in current schema)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
        avatar: validatedData.avatar,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Transform response to match frontend expectations
    const transformedUser = {
      ...user,
      phone: validatedData.phone || '',
      status: validatedData.status || 'ACTIVE',
      company: validatedData.company || '',
      department: validatedData.department || '',
      position: validatedData.position || '',
      location: validatedData.location || '',
      lastLogin: user.updatedAt.toISOString(),
      // Map database role back to frontend role
      role: validatedData.role, // Use the original frontend role
    };
    
    return NextResponse.json(transformedUser, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}); 