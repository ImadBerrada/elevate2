import { NextRequest, NextResponse } from 'next/server';
import { seedFacilities } from '@/lib/seed-facilities';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting facility seeding...');
    
    const result = await seedFacilities();
    
    return NextResponse.json({
      success: true,
      message: 'Facility data seeded successfully',
      data: result
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error seeding facilities:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to seed facility data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 