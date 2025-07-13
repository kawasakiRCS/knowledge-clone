# ESLint/TypeScript エラー大量修正計画

**関連Issue**: [#41](https://github.com/kawasakiRCS/knowledge-clone/issues/41)

## 📊 エラー分析サマリー

- **総エラー数**: 100+個
- **ビルド状態**: 失敗（インポートエラー）
- **影響ファイル**: 46ファイル

## 🎯 修正戦略（4フェーズ）

### Phase 1: ビルド失敗解消（最優先） 🔴

**目標**: npm run build を成功させる

#### 1.1 インポートエラー修正
- [ ] `src/components/knowledge/KnowledgeListItem.tsx` - default exportに変更
- [ ] `src/components/knowledge/KnowledgeSubList.tsx` - default exportに変更
- [ ] `src/lib/auth/index.ts` - useAuth, authOptionsをexport追加

**完了判定**: `npm run build` でImport Errorが0になる

---

### Phase 2: TypeScript品質向上 🟡

**目標**: 型安全性とコード品質向上

#### 2.1 any型削除（30箇所）
**API Routes (7ファイル)**
- [ ] `src/app/api/knowledge/[id]/route.ts:5` - レスポンス型定義
- [ ] `src/app/api/knowledge/histories/[id]/route.ts:9` - パラメータ型定義
- [ ] `src/app/api/knowledge/history/[id]/route.ts:19` - データ型定義
- [ ] `src/app/api/knowledge/show-history/route.ts` - authOptions型定義

**Components (8ファイル)**
- [ ] `src/components/knowledge/KnowledgeListItem.tsx:29,30` - props型定義
- [ ] `src/components/knowledge/KnowledgePopularityPage.tsx:31-35` - state型定義
- [ ] `src/components/knowledge/KnowledgeSearchPage.tsx:45` - イベント型定義
- [ ] `src/components/layout/LayoutNoMenu.tsx:28` - children型定義

**Tests (8ファイル)**
- [ ] `src/__tests__/pages/open/knowledge/histories/[id].test.tsx:33,44` - mock型定義
- [ ] `src/components/layout/__tests__/CommonScripts.test.tsx:17,18,91` - mock型定義
- [ ] その他テストファイルのmock型定義

**Utils (4ファイル)**
- [ ] `src/utils/common.ts` - 8箇所のany型定義
- [ ] `src/hooks/useLocale.ts:83` - イベント型定義
- [ ] `src/lib/hooks/useLocale.ts:13,83` - API型定義

#### 2.2 未使用変数削除（15箇所）
- [ ] `src/app/api/knowledge/list/route.ts:144-146` - group, creator, template
- [ ] `src/app/api/knowledge/show-history/route.ts:7` - headers
- [ ] `src/app/error.tsx:17` - reset
- [ ] `src/app/knowledge/likes/[id]/page.tsx:35,62` - isAuthenticated, err
- [ ] その他10箇所の未使用変数

#### 2.3 require()をESM importに変更（4箇所）
- [ ] `src/__tests__/pages/open/knowledge/histories/[id].test.tsx:176,219`
- [ ] `src/components/knowledge/__tests__/KnowledgeListPage.test.tsx:50`
- [ ] `src/components/knowledge/__tests__/KnowledgePopularityPage.test.tsx:154`

---

### Phase 3: Next.js最適化 🟠

**目標**: Next.js推奨パターンの適用

#### 3.1 Link component使用（5箇所）
- [ ] `src/app/authorizer_error/page.tsx:19` - ホームページリンク
- [ ] `src/components/error/ErrorPage.tsx:16` - ホームページリンク
- [ ] `src/components/knowledge/KnowledgeListPage.tsx:165` - stocks ページリンク

#### 3.2 Image component使用（10箇所）
- [ ] `src/components/knowledge/KnowledgeHistory.tsx:115` - 履歴画像
- [ ] `src/components/knowledge/KnowledgeListItem.tsx:65,77` - リストアイテム画像
- [ ] `src/components/knowledge/KnowledgePopularityPage.tsx:162,176` - 人気記事画像
- [ ] `src/components/layout/CommonNavbar.tsx:158,198` - ナビバー画像
- [ ] `src/app/open/knowledge/histories/[id]/page.tsx:165` - 履歴詳細画像

#### 3.3 CSS読み込み最適化（4箇所）
- [ ] `src/app/layout.tsx:41` - グローバルCSS
- [ ] `src/components/layout/CommonHeader.tsx:74,77,80,83` - テーマCSS
- [ ] `src/app/open/knowledge/history/[id]/page.tsx:78` - ページ固有CSS

#### 3.4 同期スクリプト修正（1箇所）
- [ ] `src/app/open/knowledge/histories/[id]/page.tsx:92` - 非同期読み込みに変更

---

### Phase 4: React品質向上 🟢

**目標**: React ベストプラクティスの適用

#### 4.1 useEffect依存配列修正（3箇所）
- [ ] `src/app/open/knowledge/histories/[id]/page.tsx:49` - fetchHistories依存追加
- [ ] `src/components/knowledge/KnowledgeListPage.tsx:80` - initialData, params依存追加

#### 4.2 displayName追加（1箇所）
- [ ] `src/components/layout/__tests__/LayoutNoMenu.test.tsx:12` - mock component名前追加

#### 4.3 エスケープ文字修正（2箇所）
- [ ] `src/components/layout/__tests__/LayoutNoMenu.test.tsx:140` - アポストロフィエスケープ

---

## 📈 進捗追跡

### Phase 1 進捗 (0/3)
- [ ] KnowledgeListItem.tsx修正
- [ ] KnowledgeSubList.tsx修正  
- [ ] @/lib/auth/index.ts修正

### Phase 2 進捗 (0/47)
- [ ] any型削除 (0/30)
- [ ] 未使用変数削除 (0/15)
- [ ] require()修正 (0/4)

### Phase 3 進捗 (0/21)
- [ ] Link使用 (0/5)
- [ ] Image使用 (0/10)
- [ ] CSS最適化 (0/4)
- [ ] 同期スクリプト修正 (0/1)

### Phase 4 進捗 (0/6)
- [ ] useEffect修正 (0/3)
- [ ] displayName追加 (0/1)
- [ ] エスケープ修正 (0/2)

---

## 🧪 検証項目

### ビルド検証
- [ ] `npm run build` - エラー0
- [ ] `npm run typecheck` - エラー0（コマンド追加要）
- [ ] `npm run lint` - エラー0

### 機能検証
- [ ] 全ページの表示確認
- [ ] ナビゲーション動作確認
- [ ] 画像読み込み確認

---

## 📝 実装ノート

### 型定義方針
- `any`型は具体的な型に置換
- API responseは適切なinterface定義
- Event handlersは正しいイベント型使用

### Next.js最適化方針
- `<Link>`でのpage遷移統一
- `<Image>`での画像最適化適用
- CSS-in-JSまたは next/dynamic での読み込み

### コミット戦略
- 各Phase完了時にコミット
- Issue #41 と紐づけたコミットメッセージ
- 段階的なリリース可能状態維持

---

**作成日**: 2025-07-13  
**更新日**: 2025-07-13  
**責任者**: Claude Code