import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all tenants with their agreements
    const tenants = await prisma.tenant.findMany({
      include: {
        agreements: {
          include: {
            property: true,
            rentalUnit: {
              include: {
                unitType: true
              }
            }
          }
        }
      }
    });

    // Get all agreements
    const agreements = await prisma.tenantAgreement.findMany({
      include: {
        tenant: true,
        property: true,
        rentalUnit: {
          include: {
            unitType: true
          }
        }
      }
    });

    return NextResponse.json({
      tenants: tenants.map(tenant => ({
        ...tenant,
        debug: {
          agreementsCount: tenant.agreements.length,
          activeAgreements: tenant.agreements.filter(a => a.status === 'ACTIVE').length,
          rentAmounts: tenant.agreements.map(a => ({
            id: a.id,
            status: a.status,
            rentAmount: a.rentAmount,
            rentAmountType: typeof a.rentAmount,
            rentAmountString: String(a.rentAmount),
            rentAmountNumber: Number(a.rentAmount),
          }))
        }
      })),
      agreements: agreements.map(agreement => ({
        ...agreement,
        debug: {
          rentAmount: agreement.rentAmount,
          rentAmountType: typeof agreement.rentAmount,
          rentAmountString: String(agreement.rentAmount),
          rentAmountNumber: Number(agreement.rentAmount),
          tenantName: `${agreement.tenant.firstName} ${agreement.tenant.lastName}`,
          propertyName: agreement.property.name,
          unitNumber: agreement.rentalUnit.unitNumber
        }
      }))
    });

  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { error: 'Debug API failed', details: error },
      { status: 500 }
    );
  }
} 