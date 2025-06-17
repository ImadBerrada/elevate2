import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const units = await prisma.propertyRentalUnit.findMany({
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        unitType: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { property: { name: 'asc' } },
        { unitNumber: 'asc' }
      ]
    });

    return NextResponse.json({
      totalUnits: units.length,
      unitsByStatus: {
        VACANT: units.filter(u => u.status === 'VACANT').length,
        OCCUPIED: units.filter(u => u.status === 'OCCUPIED').length,
        MAINTENANCE: units.filter(u => u.status === 'MAINTENANCE').length,
        RESERVED: units.filter(u => u.status === 'RESERVED').length,
      },
      unitsByProperty: units.reduce((acc: any, unit) => {
        const propertyName = unit.property.name;
        if (!acc[propertyName]) {
          acc[propertyName] = {
            propertyId: unit.property.id,
            total: 0,
            vacant: 0,
            occupied: 0,
            maintenance: 0,
            reserved: 0,
            units: []
          };
        }
        acc[propertyName].total++;
        acc[propertyName][unit.status.toLowerCase()]++;
        acc[propertyName].units.push({
          id: unit.id,
          unitNumber: unit.unitNumber,
          status: unit.status,
          rentAmount: unit.rentAmount,
          unitType: unit.unitType.name
        });
        return acc;
      }, {}),
      allUnits: units.map(unit => ({
        id: unit.id,
        unitNumber: unit.unitNumber,
        status: unit.status,
        rentAmount: unit.rentAmount,
        propertyId: unit.propertyId,
        propertyName: unit.property.name,
        unitType: unit.unitType.name
      }))
    });

  } catch (error) {
    console.error('Debug rental units error:', error);
    return NextResponse.json(
      { error: 'Debug API failed', details: error },
      { status: 500 }
    );
  }
} 