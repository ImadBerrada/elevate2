import { NextRequest, NextResponse } from 'next/server';
import ezeePMSClient from '@/lib/ezee-pms-client';

export async function GET() {
  try {
    console.log('Testing eZee PMS connection...');
    
    // Test basic connection
    const basicTest = await ezeePMSClient.testBasicConnection();
    console.log('Basic connection test result:', basicTest);
    
    // Test full connection
    const fullTest = await ezeePMSClient.testConnection();
    console.log('Full connection test result:', fullTest);
    
    return NextResponse.json({
      success: basicTest.success,
      message: basicTest.message,
      basicTest,
      fullTest,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  return GET();
} 