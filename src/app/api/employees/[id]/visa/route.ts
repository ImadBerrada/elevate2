import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const visaSchema = z.object({
  visaNumber: z.string().optional(),
  visaType: z.string().optional(),
  issueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  expiryDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  sponsor: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional().transform(val => val ? new Date(val) : undefined),
  emiratesId: z.string().optional(),
  emiratesIdExpiry: z.string().optional().transform(val => val ? new Date(val) : undefined),
  laborCardNumber: z.string().optional(),
  laborCardExpiry: z.string().optional().transform(val => val ? new Date(val) : undefined),
  visaDocument: z.string().optional(),
  passportDocument: z.string().optional(),
  emiratesIdDocument: z.string().optional(),
  laborCardDocument: z.string().optional(),
});

async function handler(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const employeeId = params.id;
  const userId = request.user!.userId;

  // Verify employee belongs to user
  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      userId: userId,
    },
  });

  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  if (request.method === 'GET') {
    try {
      const visa = await prisma.employeeVisa.findUnique({
        where: { employeeId },
      });

      return NextResponse.json(visa);
    } catch (error) {
      console.error('Error fetching visa:', error);
      return NextResponse.json({ error: 'Failed to fetch visa' }, { status: 500 });
    }
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const body = await request.json();
      const validatedData = visaSchema.parse(body);

      const visa = await prisma.employeeVisa.upsert({
        where: { employeeId },
        update: validatedData,
        create: {
          employeeId,
          ...validatedData,
        },
      });

      return NextResponse.json(visa);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
      }
      console.error('Error saving visa:', error);
      return NextResponse.json({ error: 'Failed to save visa' }, { status: 500 });
    }
  }

  if (request.method === 'DELETE') {
    try {
      await prisma.employeeVisa.delete({
        where: { employeeId },
      });

      return NextResponse.json({ message: 'Visa deleted successfully' });
    } catch (error) {
      console.error('Error deleting visa:', error);
      return NextResponse.json({ error: 'Failed to delete visa' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
export const PUT = withAuth(handler);
export const DELETE = withAuth(handler); 