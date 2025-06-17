import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';

// GET /api/manager-stats - Get aggregated statistics for manager's assigned companies
export const GET = withRole(['MANAGER'])(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user!.userId;

    // Get manager's assigned companies
    const assignments = await prisma.managerAssignment.findMany({
      where: {
        userId: userId,
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            status: true,
            employeeCount: true,
            revenue: true,
            createdAt: true,
          },
        },
      },
    });

    const assignedCompanyIds = assignments.map(assignment => assignment.companyId);

    if (assignedCompanyIds.length === 0) {
      return NextResponse.json({
        totalCompanies: 0,
        totalEmployees: 0,
        activeCompanies: 0,
        inactiveCompanies: 0,
        totalRevenue: 0,
        companiesByIndustry: [],
        employeesByDepartment: [],
        recentActivities: [],
        platformsAccess: [],
      });
    }

    // Get detailed company data
    const companies = await prisma.company.findMany({
      where: {
        id: { in: assignedCompanyIds },
      },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    // Get employees data
    const employees = await prisma.employee.findMany({
      where: {
        companyId: { in: assignedCompanyIds },
      },
      select: {
        id: true,
        department: true,
        status: true,
        startDate: true,
        companyId: true,
      },
    });

    // Calculate statistics
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.status === 'ACTIVE').length;
    const inactiveCompanies = totalCompanies - activeCompanies;
    const totalEmployees = employees.length;

    // Calculate total revenue (if available)
    const totalRevenue = companies.reduce((sum, company) => {
      const revenue = company.revenue ? parseFloat(company.revenue.replace(/[^0-9.-]+/g, '')) : 0;
      return sum + revenue;
    }, 0);

    // Group companies by industry
    const industryGroups = companies.reduce((acc, company) => {
      acc[company.industry] = (acc[company.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const companiesByIndustry = Object.entries(industryGroups).map(([industry, count]) => ({
      industry,
      count,
    }));

    // Group employees by department
    const departmentGroups = employees.reduce((acc, employee) => {
      acc[employee.department] = (acc[employee.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const employeesByDepartment = Object.entries(departmentGroups).map(([department, count]) => ({
      department,
      count,
    }));

    // Get platforms access
    const platformsAccess = [...new Set(assignments.flatMap(a => a.platforms))];

    // Generate recent activities (mock data for now)
    const recentActivities = [
      {
        id: '1',
        action: 'New employee added',
        company: companies[0]?.name || 'Company A',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        type: 'employee',
      },
      {
        id: '2',
        action: 'Company status updated',
        company: companies[1]?.name || 'Company B',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        type: 'company',
      },
      {
        id: '3',
        action: 'Employee promoted',
        company: companies[0]?.name || 'Company A',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        type: 'employee',
      },
      {
        id: '4',
        action: 'New department created',
        company: companies[2]?.name || 'Company C',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        type: 'department',
      },
    ];

    // Generate employee growth data (mock data based on current employees)
    const employeeGrowth = Array.from({ length: 6 }, (_, i) => {
      const monthsAgo = 5 - i;
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        employees: Math.floor(totalEmployees * (0.7 + (i * 0.05))), // Simulate growth
      };
    });

    return NextResponse.json({
      totalCompanies,
      totalEmployees,
      activeCompanies,
      inactiveCompanies,
      totalRevenue,
      companiesByIndustry,
      employeesByDepartment,
      employeeGrowth,
      recentActivities,
      platformsAccess,
      assignments: assignments.map(a => ({
        id: a.id,
        companyId: a.companyId,
        companyName: a.company.name,
        platforms: a.platforms,
        permissions: a.permissions,
      })),
    });
  } catch (error) {
    console.error('Error fetching manager stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manager statistics' },
      { status: 500 }
    );
  }
}); 