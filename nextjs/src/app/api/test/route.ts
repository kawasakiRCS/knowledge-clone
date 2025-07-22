import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test API working',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DEVELOPMENT_AUTH_BYPASS: process.env.DEVELOPMENT_AUTH_BYPASS,
    }
  });
}