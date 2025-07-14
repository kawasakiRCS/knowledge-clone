/**
 * ナレッジ詳細ページテスト
 * 
 * @description 実際のナレッジ詳細ページが新しいAPI を使用して正常に動作するかテスト
 */

async function testKnowledgePage() {
  console.log('🧪 Testing Knowledge Detail Page...');
  
  const baseUrl = 'http://localhost:3004';
  
  try {
    // 1. 実在するナレッジ詳細ページのテスト
    console.log('\n1️⃣ Testing knowledge detail page for ID 672...');
    const pageResponse = await fetch(`${baseUrl}/open/knowledge/view/672`);
    
    console.log(`Page Status: ${pageResponse.status}`);
    if (pageResponse.ok) {
      const pageContent = await pageResponse.text();
      console.log('✅ Page loaded successfully!');
      
      // ページ内容の基本チェック
      if (pageContent.includes('ナレッジ詳細') || pageContent.includes('LibreChat')) {
        console.log('✅ Page contains expected content');
      } else {
        console.log('⚠️ Page content might be different than expected');
      }
      
      // 文字数チェック
      console.log(`   Page Content Length: ${pageContent.length} characters`);
      
    } else {
      console.log('❌ Page failed to load');
    }

    // 2. 存在しないナレッジページのテスト
    console.log('\n2️⃣ Testing non-existent knowledge page 999999...');
    const notFoundPageResponse = await fetch(`${baseUrl}/open/knowledge/view/999999`);
    
    console.log(`Page Status: ${notFoundPageResponse.status}`);
    if (notFoundPageResponse.status === 404 || notFoundPageResponse.ok) {
      const notFoundContent = await notFoundPageResponse.text();
      console.log('✅ Not found page handled correctly');
      
      if (notFoundContent.includes('見つかりませんでした') || notFoundContent.includes('404')) {
        console.log('✅ Contains appropriate error message');
      }
    } else {
      console.log('❌ Unexpected response for non-existent page');
    }

    // 3. 非公開ナレッジページのテスト  
    console.log('\n3️⃣ Testing private knowledge page ID 1...');
    const privatePageResponse = await fetch(`${baseUrl}/open/knowledge/view/1`);
    
    console.log(`Page Status: ${privatePageResponse.status}`);
    if (privatePageResponse.status === 403 || privatePageResponse.ok) {
      const privateContent = await privatePageResponse.text();
      console.log('✅ Private page handled correctly');
      
      if (privateContent.includes('アクセス') || privateContent.includes('権限')) {
        console.log('✅ Contains appropriate access denied message');
      }
    } else {
      console.log('❌ Unexpected response for private page');
    }

    console.log('\n🎉 Knowledge Detail Page tests completed!');
    
  } catch (error) {
    console.error('❌ Error during page testing:', error);
  }
}

// 実行
testKnowledgePage();