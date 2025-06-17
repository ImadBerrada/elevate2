import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { updateUserSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Get user by ID (Admin only)
export const GET = withRole(['ADMIN', 'SUPER_ADMIN'])(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id: id },
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Transform user to match frontend expectations
    const transformedUser = {
      ...user,
      phone: '', // Default empty since not in schema yet
      status: 'ACTIVE', // Default to active for now
      company: '',
      department: '',
      position: '',
      location: '',
      lastLogin: user.updatedAt.toISOString(),
      // Map database role to frontend role
      role: user.role === 'SUPER_ADMIN' ? 'ADMIN' : user.role,
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
});

// PUT /api/users/[id] - Update user (Admin only, or user updating themselves)
export const PUT = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    
    const { id } = await params;
    const body = await request.json();
    
    // Check if user is admin or updating themselves
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(request.user!.role);
    const isSelf = request.user!.userId === id;
    
    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Validate input
    const validatedData = updateUserSchema.parse(body);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: id },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.firstName) updateData.firstName = validatedData.firstName;
    if (validatedData.lastName) updateData.lastName = validatedData.lastName;
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.avatar) updateData.avatar = validatedData.avatar;
    
    // Only admins can change roles
    if (isAdmin && validatedData.role) {
      updateData.role = validatedData.role;
    }
    
    // Hash password if provided
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12);
    }
    
    // Update user
    const user = await prisma.user.update({
      where: { id: id },
      data: updateData,
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
      role: validatedData.role || (user.role === 'SUPER_ADMIN' ? 'ADMIN' : user.role),
    };
    
    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
});

// DELETE /api/users/[id] - Delete user (Admin only)
export const DELETE = withRole(['ADMIN', 'SUPER_ADMIN'])(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: id },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent self-deletion
    if (request.user!.userId === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id: id },
    });
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}); 