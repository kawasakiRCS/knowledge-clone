/**
 * Database connection test API endpoint
 * 
 * @description Tests the database connection and returns connection status
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const version = await prisma.$queryRaw`SELECT version()`;
    
    // Count tables
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    // Count knowledges
    const knowledgeCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM knowledges
    `;
    
    return NextResponse.json({
      status: 'connected',
      database: {
        version: version[0].version,
        tableCount: Number(tableCount[0].count),
        knowledgeCount: Number(knowledgeCount[0].count)
      },
      connectionDetails: {
        host: 'localhost',
        port: 5433,
        database: 'knowledge',
        user: 'knowledge_user'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}