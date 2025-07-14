#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * @description Tests connection to PostgreSQL database on port 5433
 */

const { PrismaClient } = require('@prisma/client');

const DATABASE_URL = 'postgresql://knowledge_user:knowledge_pass@localhost:5433/knowledge';

async function testConnection() {
  console.log('🔌 Testing database connection...');
  console.log(`📍 Connecting to: ${DATABASE_URL}`);
  
  // Override DATABASE_URL for this test
  process.env.DATABASE_URL = DATABASE_URL;
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Test basic connection
    console.log('\n1️⃣ Testing basic connection...');
    await prisma.$connect();
    console.log('✅ Connection successful!');

    // Get database version
    console.log('\n2️⃣ Getting database version...');
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database version:', result[0].version);

    // Count tables
    console.log('\n3️⃣ Counting tables...');
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✅ Number of tables:', tableCount[0].count);

    // List some tables
    console.log('\n4️⃣ Listing tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name 
      LIMIT 10
    `;
    console.log('✅ Tables found:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Test a simple query on knowledges table if it exists
    console.log('\n5️⃣ Testing knowledges table...');
    try {
      const knowledgeCount = await prisma.$queryRaw`
        SELECT COUNT(*) FROM knowledges
      `;
      console.log('✅ Knowledges count:', knowledgeCount[0].count);
    } catch (error) {
      console.log('⚠️  Knowledges table not found or empty');
    }

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📋 Connection details:');
    console.log('   Host: localhost');
    console.log('   Port: 5433');
    console.log('   Database: knowledge');
    console.log('   User: knowledge_user');

  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection().catch(console.error);