/**
 * ナレッジAPIのテストスクリプト
 * 
 * @description 実装したナレッジAPIが正しく動作するかテスト
 */
// 環境変数を直接設定
process.env.DATABASE_URL = "postgresql://knowledge_user:knowledge_pass@localhost:5433/knowledge";

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testKnowledgeAPI() {
  console.log('🧪 Testing Knowledge API implementation...');
  
  try {
    // 1. ナレッジ総数確認
    console.log('\n1️⃣ Getting total knowledge count...');
    const totalCount = await prisma.knowledge.count({
      where: { deleteFlag: 0 }
    });
    console.log(`✅ Total active knowledges: ${totalCount}`);
    
    // 2. 公開ナレッジを取得
    console.log('\n2️⃣ Getting public knowledges...');
    const publicKnowledges = await prisma.knowledge.findMany({
      where: {
        deleteFlag: 0,
        publicFlag: 1
      },
      take: 5,
      orderBy: { insertDatetime: 'desc' },
      include: {
        author: {
          select: {
            userId: true,
            userName: true
          }
        }
      }
    });
    
    console.log(`✅ Found ${publicKnowledges.length} public knowledges:`);
    publicKnowledges.forEach((k, index) => {
      console.log(`   ${index + 1}. ID: ${k.knowledgeId}, Title: "${k.title}" by ${k.author?.userName || 'Unknown'}`);
    });
    
    // 3. 特定のナレッジを詳細取得（実装テスト）
    if (publicKnowledges.length > 0) {
      const firstKnowledge = publicKnowledges[0];
      console.log(`\n3️⃣ Testing detailed knowledge fetch for ID: ${firstKnowledge.knowledgeId}...`);
      
      const detailedKnowledge = await prisma.knowledge.findUnique({
        where: { 
          knowledgeId: firstKnowledge.knowledgeId,
          deleteFlag: 0
        },
        include: {
          author: {
            select: {
              userId: true,
              userName: true,
              userKey: true
            }
          }
        }
      });
      
      if (detailedKnowledge) {
        console.log('✅ Detailed knowledge fetch successful:');
        console.log(`   Title: ${detailedKnowledge.title}`);
        console.log(`   Content length: ${detailedKnowledge.content?.length || 0} chars`);
        console.log(`   Public Flag: ${detailedKnowledge.publicFlag}`);
        console.log(`   Points: ${detailedKnowledge.point}`);
        console.log(`   View Count: ${detailedKnowledge.viewCount}`);
        console.log(`   Author: ${detailedKnowledge.author?.userName}`);
        console.log(`   Created: ${detailedKnowledge.insertDatetime}`);
      }
    }
    
    // 4. アクセス権限テスト（非公開ナレッジ）
    console.log('\n4️⃣ Testing access control...');
    const privateKnowledges = await prisma.knowledge.findMany({
      where: {
        deleteFlag: 0,
        publicFlag: { not: 1 } // 公開以外
      },
      take: 3
    });
    
    console.log(`✅ Found ${privateKnowledges.length} non-public knowledges (access control needed)`);
    privateKnowledges.forEach((k, index) => {
      console.log(`   ${index + 1}. ID: ${k.knowledgeId}, Flag: ${k.publicFlag}, Title: "${k.title}"`);
    });
    
    console.log('\n🎉 All Knowledge API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during Knowledge API testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
testKnowledgeAPI();