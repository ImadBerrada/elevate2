import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { format, subDays, addDays } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '1y':
        startDate = subDays(now, 365);
        break;
      default:
        startDate = subDays(now, 30);
    }

    // Get bookings for guest invoices
    const bookings = await prisma.retreatBooking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        guest: true,
        retreat: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Get expense transactions for vendor invoices
    const expenseTransactions = await prisma.retreatFinancialTransaction.findMany({
      where: {
        type: 'EXPENSE',
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        retreat: true,
        facility: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Transform bookings to guest invoices
    const guestInvoices = bookings.map(booking => {
      // Build address from separate fields
      const addressParts = [
        booking.guest.addressStreet,
        booking.guest.addressCity,
        booking.guest.addressState,
        booking.guest.addressCountry,
        booking.guest.addressPostalCode
      ].filter(Boolean);
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Address not provided';

      return {
        id: booking.id,
        invoiceNumber: `INV-G-${booking.id.slice(-6).toUpperCase()}`,
        type: 'GUEST',
        recipientName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        recipientEmail: booking.guest.email,
        recipientAddress: fullAddress,
        bookingId: booking.id,
        retreatType: booking.retreat.type,
        retreatTitle: booking.retreat.title,
        issueDate: format(booking.createdAt, 'yyyy-MM-dd'),
        dueDate: format(addDays(booking.createdAt, 30), 'yyyy-MM-dd'),
        items: [{
          id: '1',
          description: `${booking.retreat.title} - ${booking.retreat.type}`,
          quantity: booking.numberOfGuests,
          unitPrice: Number(booking.totalAmount) / booking.numberOfGuests,
          taxRate: 5,
          totalPrice: Number(booking.totalAmount)
        }],
        subtotal: Number(booking.totalAmount) / 1.05,
        taxAmount: Number(booking.totalAmount) * 0.05 / 1.05,
        discountAmount: 0,
        totalAmount: Number(booking.totalAmount),
        status: booking.paymentStatus === 'PAID' ? 'PAID' : 
                booking.paymentStatus === 'PENDING' ? 'SENT' : 'DRAFT',
        paymentMethod: booking.paymentMethod,
        paymentDate: booking.paymentStatus === 'PAID' ? format(booking.updatedAt, 'yyyy-MM-dd') : null,
        notes: booking.specialRequests || '',
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString()
      };
    });

    // Transform expense transactions to vendor invoices
    const vendorInvoices = expenseTransactions.map(transaction => ({
      id: transaction.id,
      invoiceNumber: `INV-V-${transaction.id.slice(-6).toUpperCase()}`,
      type: 'VENDOR',
      recipientName: transaction.description?.split(' - ')[0] || 'Vendor',
      recipientEmail: 'vendor@example.com',
      recipientAddress: 'Vendor address not provided',
      category: transaction.category,
      issueDate: format(transaction.createdAt, 'yyyy-MM-dd'),
      dueDate: format(addDays(transaction.createdAt, 30), 'yyyy-MM-dd'),
      items: [{
        id: '1',
        description: transaction.description || 'Service/Product',
        quantity: 1,
        unitPrice: Number(transaction.amount),
        taxRate: 5,
        totalPrice: Number(transaction.amount)
      }],
      subtotal: Number(transaction.amount) / 1.05,
      taxAmount: Number(transaction.amount) * 0.05 / 1.05,
      discountAmount: 0,
      totalAmount: Number(transaction.amount),
      status: transaction.status === 'PROCESSED' ? 'PAID' : 
              transaction.status === 'PENDING' ? 'SENT' : 'DRAFT',
      paymentMethod: transaction.reference ? 'Bank Transfer' : null,
      paymentDate: transaction.status === 'PROCESSED' ? format(transaction.createdAt, 'yyyy-MM-dd') : null,
      notes: transaction.reference || '',
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString()
    }));

    let allInvoices = [...guestInvoices, ...vendorInvoices];
    
    if (type === 'GUEST') {
      allInvoices = guestInvoices;
    } else if (type === 'VENDOR') {
      allInvoices = vendorInvoices;
    }

    if (status && status !== 'ALL') {
      allInvoices = allInvoices.filter(inv => inv.status === status);
    }

    allInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalInvoiced = allInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = allInvoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPending = allInvoices.filter(inv => inv.status === 'SENT').reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalOverdue = allInvoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      return inv.status !== 'PAID' && dueDate < now;
    }).reduce((sum, inv) => sum + inv.totalAmount, 0);

    const statusBreakdown = {
      DRAFT: allInvoices.filter(inv => inv.status === 'DRAFT').length,
      SENT: allInvoices.filter(inv => inv.status === 'SENT').length,
      PAID: allInvoices.filter(inv => inv.status === 'PAID').length,
      OVERDUE: allInvoices.filter(inv => {
        const dueDate = new Date(inv.dueDate);
        return inv.status !== 'PAID' && dueDate < now;
      }).length
    };

    return NextResponse.json({
      invoices: allInvoices,
      metrics: {
        totalInvoiced,
        totalPaid,
        totalPending,
        totalOverdue,
        invoiceCount: allInvoices.length
      },
      statusBreakdown,
      period,
      dateRange: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(now, 'yyyy-MM-dd')
      }
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, recipientName, bookingId, items } = body;

    if (type === 'GUEST' && bookingId) {
      const booking = await prisma.retreatBooking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'PENDING',
          updatedAt: new Date()
        },
        include: {
          guest: true,
          retreat: true
        }
      });

      return NextResponse.json({
        success: true,
        invoice: {
          id: booking.id,
          invoiceNumber: `INV-G-${booking.id.slice(-6).toUpperCase()}`,
          type: 'GUEST',
          recipientName: `${booking.guest.firstName} ${booking.guest.lastName}`,
          status: 'SENT'
        }
      });
    } else if (type === 'VENDOR') {
      const totalAmount = items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitPrice * (1 + item.taxRate / 100)), 0);

      const transaction = await prisma.retreatFinancialTransaction.create({
        data: {
          type: 'EXPENSE',
          category: 'PROFESSIONAL_SERVICES',
          amount: totalAmount,
          description: `${recipientName} - ${items[0]?.description || 'Service'}`,
          status: 'PENDING',
          reference: `INV-V-${Date.now()}`,
          transactionDate: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        invoice: {
          id: transaction.id,
          invoiceNumber: `INV-V-${transaction.id.slice(-6).toUpperCase()}`,
          type: 'VENDOR',
          recipientName,
          status: 'SENT'
        }
      });
    }

    return NextResponse.json({ error: 'Invalid invoice type' }, { status: 400 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paymentMethod, paymentDate } = body;

    // Update booking payment status for guest invoices
    if (id.startsWith('booking_')) {
      const bookingId = id.replace('booking_', '');
      await prisma.retreatBooking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: status === 'PAID' ? 'PAID' : 'PENDING',
          paymentMethod: paymentMethod || null,

          updatedAt: new Date()
        }
      });
    } else {
      // Update transaction status for vendor invoices
      await prisma.retreatFinancialTransaction.update({
        where: { id },
        data: {
          status: status === 'PAID' ? 'PROCESSED' : 'PENDING',
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}
