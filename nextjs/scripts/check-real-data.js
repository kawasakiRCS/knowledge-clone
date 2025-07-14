#!/usr/bin/env node

/**
 * Check real data in database
 */

const { PrismaClient } = require('@prisma/client');

// Override DATABASE_URL
process.env.DATABASE_URL = 'postgresql://knowledge_user:knowledge_pass@localhost:5433/knowledge';

const prisma = new PrismaClient({
  log: ['query'],
});

async function checkData() {
  try {
    console.log('🔍 Checking real data in database...\n');

    // Get latest knowledges
    console.log('📄 Latest 5 knowledges:');
    const knowledges = await prisma.$queryRaw`
      SELECT knowledge_id, title, insert_user, insert_datetime, like_count, comment_count, type_id
      FROM knowledges 
      WHERE delete_flag = 0
      ORDER BY insert_datetime DESC 
      LIMIT 5
    `;
    
    knowledges.forEach(k => {
      console.log(`- #${k.knowledge_id}: ${k.title}`);
      console.log(`  User: ${k.insert_user}, Date: ${k.insert_datetime}`);
      console.log(`  Likes: ${k.like_count}, Comments: ${k.comment_count}, Type: ${k.type_id}\n`);
    });

    // Get user names
    console.log('👥 Users for these knowledges:');
    const userIds = [...new Set(knowledges.map(k => k.insert_user))];
    const users = await prisma.$queryRaw`
      SELECT user_no, user_id, user_name 
      FROM users 
      WHERE user_no = ANY(${userIds})
    `;
    
    users.forEach(u => {
      console.log(`- User #${u.user_no}: ${u.user_name} (${u.user_id})`);
    });

    // Get popular tags
    console.log('\n🏷️ Popular tags:');
    const tags = await prisma.$queryRaw`
      SELECT t.tag_id, t.tag_name, COUNT(kt.knowledge_id) as count
      FROM tags t
      LEFT JOIN knowledge_tags kt ON t.tag_id = kt.tag_id
      WHERE t.delete_flag = 0
      GROUP BY t.tag_id, t.tag_name
      ORDER BY count DESC
      LIMIT 5
    `;
    
    tags.forEach(t => {
      console.log(`- ${t.tag_name}: ${t.count} knowledges`);
    });

    // Get template types
    console.log('\n📋 Template types:');
    const templates = await prisma.$queryRaw`
      SELECT type_id, type_name, type_icon, type_key
      FROM template_masters
      ORDER BY type_id
    `;
    
    templates.forEach(t => {
      console.log(`- Type #${t.type_id}: ${t.type_name} (${t.type_key}) - Icon: ${t.type_icon}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();