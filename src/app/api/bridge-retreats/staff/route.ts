import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const staff = await prisma.employee.findMany({
      where: {
        ...(department && { department }),
        ...(status && { status: status as any }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { position: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        company: {
          select: {
            name: true
          }
        },
        visa: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    // Calculate department statistics
    const departmentStats = await prisma.employee.groupBy({
      by: ['department'],
      _count: { department: true },
      orderBy: {
        department: 'asc'
      }
    });

    // Calculate status statistics
    const statusStats = await prisma.employee.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const analytics = {
      staff,
      statistics: {
        total: staff.length,
        byDepartment: departmentStats.map(item => ({
          department: item.department,
          count: item._count.department
        })),
        byStatus: statusStats.map(item => ({
          status: item.status,
          count: item._count.status
        }))
      }
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      firstNameArabic,
      lastNameArabic,
      email,
      phone,
      position,
      department,
      salary,
      actualSalary,
      startDate,
      status,
      location,
      manager,
      skills,
      companyId,
      actualCompanyId,
      userId
    } = body;

    // Check if employee with email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email }
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        firstNameArabic,
        lastNameArabic,
        email,
        phone,
        position,
        department,
        salary,
        actualSalary,
        startDate: new Date(startDate),
        status: status || 'ACTIVE',
        location,
        manager,
        skills: skills || [],
        companyId,
        actualCompanyId,
        userId
      },
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
} 