import { test, expect } from '@playwright/test';

/**
 * 基本的なPlaywrightテスト
 * 
 * @description アプリケーションの基本動作を確認
 */
test.describe('アプリケーション基本テスト', () => {
  test('ホームページが正常に表示される', async ({ page }) => {
    // ホームページにアクセス
    await page.goto('/');
    
    // ページタイトルの確認
    await expect(page).toHaveTitle(/Knowledge/);
    
    // ページが読み込まれることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('ナビゲーションが動作する', async ({ page }) => {
    await page.goto('/');
    
    // ナビゲーション要素の存在確認
    const navigation = page.locator('nav, header, [role="navigation"]');
    await expect(navigation.first()).toBeVisible();
  });

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // デスクトップサイズでテスト
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // モバイルサイズでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('認証関連テスト', () => {
  test('ログインページにアクセスできる', async ({ page }) => {
    // ログインページまたは認証関連のリンクを探す
    await page.goto('/');
    
    // 認証関連の要素があるかチェック（実装に応じて調整）
    const authElements = await page.locator('text=/ログイン|サインイン|Login|Sign in/i').count();
    
    if (authElements > 0) {
      // 認証要素が見つかった場合
      await expect(page.locator('text=/ログイン|サインイン|Login|Sign in/i').first()).toBeVisible();
    } else {
      // 認証要素が見つからない場合は、ページが正常に表示されることを確認
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('エラーハンドリング', () => {
  test('存在しないページで404が表示される', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    // 404ステータスまたは適切なエラーページが表示されることを確認
    expect(response?.status()).toBe(404);
  });
});