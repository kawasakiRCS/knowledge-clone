#!/usr/bin/env node

/**
 * Check real data in database (Fixed version)
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
    console.log('📄 Latest 5 knowledges with user info:');
    const knowledges = await prisma.$queryRaw`
      SELECT 
        k.knowledge_id, 
        k.title, 
        k.insert_user, 
        k.insert_datetime, 
        k.like_count, 
        k.comment_count, 
        k.type_id,
        k.tag_names,
        k.point,
        u.user_name,
        u.user_key
      FROM knowledges k
      LEFT JOIN users u ON k.insert_user = u.user_id
      WHERE k.delete_flag = 0
      ORDER BY k.insert_datetime DESC 
      LIMIT 5
    `;
    
    knowledges.forEach(k => {
      console.log(`\n- #${k.knowledge_id}: ${k.title}`);
      console.log(`  User: ${k.user_name} (ID: ${k.insert_user})`)
      console.log(`  Date: ${k.insert_datetime}`);
      console.log(`  Likes: ${k.like_count || 0}, Comments: ${k.comment_count || 0}, Points: ${k.point || 0}`);
      console.log(`  Type ID: ${k.type_id || 'N/A'}`);
      if (k.tag_names) {
        console.log(`  Tags: ${k.tag_names}`);
      }
    });

    // Get template types
    console.log('\n\n📋 Template types:');
    const templates = await prisma.$queryRaw`
      SELECT type_id, type_name, type_icon, type_key
      FROM template_masters
      WHERE delete_flag = 0
      ORDER BY type_id
    `;
    
    templates.forEach(t => {
      console.log(`- Type #${t.type_id}: ${t.type_name} (${t.type_key}) - Icon: ${t.type_icon || 'N/A'}`);
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
      LIMIT 10
    `;
    
    if (tags.length > 0) {
      tags.forEach(t => {
        console.log(`- ${t.tag_name}: ${t.count} knowledges`);
      });
    } else {
      console.log('No tags found with counts.');
    }

    // Get groups
    console.log('\n👥 Groups:');
    const groups = await prisma.$queryRaw`
      SELECT g.group_id, g.group_name, COUNT(kg.knowledge_id) as knowledge_count
      FROM groups g
      LEFT JOIN knowledge_groups kg ON g.group_id = kg.group_id AND kg.delete_flag = 0
      WHERE g.delete_flag = 0
      GROUP BY g.group_id, g.group_name
      ORDER BY knowledge_count DESC
      LIMIT 5
    `;
    
    if (groups.length > 0) {
      groups.forEach(g => {
        console.log(`- ${g.group_name} (ID: ${g.group_id}): ${g.knowledge_count} knowledges`);
      });
    } else {
      console.log('No groups found.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();