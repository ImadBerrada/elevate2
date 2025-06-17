import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET - Export invoices as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agreementId = searchParams.get('agreementId') || '';
    const tenantId = searchParams.get('tenantId') || '';
    const propertyId = searchParams.get('propertyId') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build where clause
    const where: any = {};
    
    if (agreementId) where.agreementId = agreementId;
    if (status && status !== 'all') where.status = status.toUpperCase();
    
    if (tenantId) {
      where.agreement = {
        tenantId: tenantId
      };
    } else if (propertyId) {
      where.agreement = {
        propertyId: propertyId
      };
    }
    
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { agreement: {
          tenant: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }
        }},
        { agreement: {
          property: {
            name: { contains: search, mode: 'insensitive' }
          }
        }}
      ];
    }
    
    if (startDate && endDate) {
      where.dueDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Fetch all matching invoices (no pagination for export)
    const invoices = await prisma.realEstateInvoice.findMany({
      where,
      include: {
        agreement: {
          include: {
            tenant: true,
            property: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                area: true
              }
            },
            rentalUnit: {
              select: {
                id: true,
                unitNumber: true,
                unitType: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Convert to CSV format
    const csvHeaders = [
      'Invoice Number',
      'Status',
      'Tenant Name',
      'Tenant Email',
      'Property Name',
      'Property Address',
      'Unit Number',
      'Amount',
      'Tax Amount',
      'Total Amount',
      'Issue Date',
      'Due Date',
      'Paid Date',
      'Description',
      'Days Overdue',
      'Created Date'
    ];

    const csvRows = invoices.map(invoice => {
      const daysOverdue = invoice.status === 'PENDING' && new Date(invoice.dueDate) < new Date() 
        ? Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24))
        : 0;

      const paidDate = invoice.status === 'PAID' ? invoice.updatedAt : null;

      return [
        invoice.invoiceNumber,
        invoice.status,
        `${invoice.agreement.tenant.firstName} ${invoice.agreement.tenant.lastName}`,
        invoice.agreement.tenant.email,
        invoice.agreement.property.name,
        `${invoice.agreement.property.address}, ${invoice.agreement.property.city || ''}`,
        invoice.agreement.rentalUnit.unitNumber,
        Number(invoice.amount),
        Number(invoice.taxAmount) || 0,
        Number(invoice.totalAmount),
        invoice.createdAt.toISOString().split('T')[0],
        invoice.dueDate.toISOString().split('T')[0],
        paidDate ? paidDate.toISOString().split('T')[0] : '',
        invoice.description || '',
        daysOverdue,
        invoice.createdAt.toISOString()
      ];
    });

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => 
        row.map(field => {
          // Escape fields that contain commas, quotes, or newlines
          if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        }).join(',')
      )
    ].join('\n');

    // Set headers for file download
    const headers = new Headers({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="invoices-export-${new Date().toISOString().split('T')[0]}.csv"`,
      'Content-Length': Buffer.byteLength(csvContent, 'utf8').toString()
    });

    return new NextResponse(csvContent, { headers });

  } catch (error) {
    console.error('Error exporting invoices:', error);
    return NextResponse.json(
      { error: 'Failed to export invoices' },
      { status: 500 }
    );
  }
} 