import { NextRequest, NextResponse } from 'next/server';
import ezeePMSClient from '@/lib/ezee-pms-client';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing eZee PMS connection...');
    
    // Test basic connection first
    const basicTest = await ezeePMSClient.testBasicConnection();
    console.log('Basic connection test result:', basicTest);
    
    if (basicTest.success) {
      // If basic connection works, try the full connection test
      const fullTest = await ezeePMSClient.testConnection();
      console.log('Full connection test result:', fullTest);
      
      return NextResponse.json({ 
        success: true,
        message: 'eZee PMS connection successful',
        isConnected: true,
        basicTest,
        fullTest,
        details: 'Connection established with eZee PMS API'
      });
    } else {
      return NextResponse.json({ 
        success: false,
        message: 'eZee PMS connection failed',
        isConnected: false,
        basicTest,
        details: basicTest.message
      });
    }
  } catch (error) {
    console.error('Error testing eZee PMS connection:', error);
    return NextResponse.json(
      { 
        error: 'eZee PMS connection test failed',
        success: false,
        isConnected: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
} 