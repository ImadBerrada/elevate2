import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET - List all payment methods
export async function GET() {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      paymentMethods,
      total: paymentMethods.length
    });

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

// POST - Create a new payment method
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Payment method name is required' },
        { status: 400 }
      );
    }

    // Check if payment method already exists
    const existingMethod = await prisma.paymentMethod.findUnique({
      where: { name: name.trim() }
    });

    if (existingMethod) {
      return NextResponse.json(
        { error: 'Payment method already exists' },
        { status: 400 }
      );
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        name: name.trim()
      }
    });

    return NextResponse.json(paymentMethod, { status: 201 });

  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
} 