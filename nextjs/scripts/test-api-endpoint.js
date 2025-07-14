/**
 * API エンドポイントテスト
 * 
 * @description 実装したAPI エンドポイントが正常に動作するかテスト
 */

async function testAPIEndpoint() {
  console.log('🧪 Testing API endpoint...');
  
  const baseUrl = 'http://localhost:3004';
  
  try {
    // 1. 実在するナレッジID 672のテスト
    console.log('\n1️⃣ Testing existing knowledge ID 672...');
    const response672 = await fetch(`${baseUrl}/api/knowledge/672`);
    const data672 = await response672.json();
    
    console.log(`Status: ${response672.status}`);
    if (response672.ok) {
      console.log('✅ Success!');
      console.log(`   Title: ${data672.title}`);
      console.log(`   Author: ${data672.insertUserName}`);
      console.log(`   Public Flag: ${data672.publicFlag}`);
      console.log(`   Content Length: ${data672.content?.length || 0} characters`);
    } else {
      console.log('❌ Failed:', data672);
    }

    // 2. 存在しないナレッジIDのテスト
    console.log('\n2️⃣ Testing non-existent knowledge ID 999999...');
    const response404 = await fetch(`${baseUrl}/api/knowledge/999999`);
    const data404 = await response404.json();
    
    console.log(`Status: ${response404.status}`);
    if (response404.status === 404) {
      console.log('✅ Correct 404 response!');
      console.log(`   Error: ${data404.error}`);
    } else {
      console.log('❌ Unexpected response:', data404);
    }

    // 3. 無効なIDフォーマットのテスト
    console.log('\n3️⃣ Testing invalid ID format...');
    const responseInvalid = await fetch(`${baseUrl}/api/knowledge/invalid`);
    const dataInvalid = await responseInvalid.json();
    
    console.log(`Status: ${responseInvalid.status}`);
    if (responseInvalid.status === 400) {
      console.log('✅ Correct 400 response!');
      console.log(`   Error: ${dataInvalid.error}`);
    } else {
      console.log('❌ Unexpected response:', dataInvalid);
    }

    // 4. 非公開ナレッジのテスト（ID 1は非公開）
    console.log('\n4️⃣ Testing private knowledge ID 1...');
    const responsePrivate = await fetch(`${baseUrl}/api/knowledge/1`);
    const dataPrivate = await responsePrivate.json();
    
    console.log(`Status: ${responsePrivate.status}`);
    if (responsePrivate.status === 403) {
      console.log('✅ Correct 403 response!');
      console.log(`   Error: ${dataPrivate.error}`);
    } else {
      console.log('❌ Unexpected response:', dataPrivate);
    }

    console.log('\n🎉 API endpoint tests completed!');
    
  } catch (error) {
    console.error('❌ Error during API testing:', error);
  }
}

// 実行
testAPIEndpoint();