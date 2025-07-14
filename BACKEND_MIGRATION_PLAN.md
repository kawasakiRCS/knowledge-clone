# バックエンド移植計画書

## 📋 概要

旧Javaシステムのバックエンド処理を完全にNext.js + TypeScript + Prismaに移植する詳細計画。フロントエンド移植（PAGE_MIGRATION_PLAN.md）と独立して実行可能なTDD対応設計。

## 🎯 移植スコープ

### Java旧システム分析結果
- **Controllerクラス**: 54クラス
- **DAOクラス**: 54クラス + 48genクラス
- **Logicクラス**: 40+クラス
- **データベース**: 78テーブル
- **主要機能**: CRUD、認証、ファイル、メール、通知、集計

## 🏗️ アーキテクチャ変換

### 1. Controller → API Routes
```
Java Controller → Next.js API Routes

旧: /src/main/java/org/support/project/knowledge/control/
新: /nextjs/src/app/api/
```

### 2. DAO → Prisma ORM
```
Java DAO → Prisma Client

旧: KnowledgesDao.java (独自ORM)
新: prisma.knowledge.findMany() (Prisma ORM)
```

### 3. Logic → Utils/Services
```
Java Logic → TypeScript Services

旧: KnowledgeLogic.java
新: /lib/services/knowledgeService.ts
```

## 📊 Controller群移植計画

### A. Open Controllers (11クラス) - 公開API
| 旧Java Controller | 新API Route | 主要メソッド | 優先度 | 工数 |
|------------------|-------------|-------------|--------|------|
| `open/KnowledgeControl.java` | `/api/open/knowledge/` | view, list, like, stocks | 🔴高 | 10日 |
| `open/AccountControl.java` | `/api/open/account/` | view, info | 🔴高 | 3日 |
| `open/SignupControl.java` | `/api/open/signup/` | signup, activate | 🔴高 | 5日 |
| `open/PasswordInitializationControl.java` | `/api/open/password/` | request, reset | 🔴高 | 4日 |
| `open/TagControl.java` | `/api/open/tags/` | list, dialog | 🟡中 | 2日 |
| `open/FileControl.java` | `/api/open/files/` | download, image | 🟡中 | 3日 |
| `open/EventControl.java` | `/api/open/events/` | list, view | 🟢低 | 3日 |
| `open/NoticeControl.java` | `/api/open/notices/` | list | 🟢低 | 2日 |
| `open/EmojiControl.java` | `/api/open/emoji/` | categories | 🟢低 | 2日 |
| `open/ThemaControl.java` | `/api/open/themes/` | list, switch | 🟢低 | 2日 |
| `open/LanguageControl.java` | `/api/open/language/` | switch | 🟢低 | 1日 |

### B. Protect Controllers (14クラス) - 認証必須API
| 旧Java Controller | 新API Route | 主要メソッド | 優先度 | 工数 |
|------------------|-------------|-------------|--------|------|
| `protect/KnowledgeControl.java` | `/api/protect/knowledge/` | save, edit, delete, comment | 🔴高 | 15日 |
| `protect/AccountControl.java` | `/api/protect/account/` | update, changekey, withdraw | 🔴高 | 7日 |
| `protect/GroupControl.java` | `/api/protect/groups/` | create, edit, members | 🟡中 | 8日 |
| `protect/StockControl.java` | `/api/protect/stocks/` | add, edit, list | 🟡中 | 5日 |
| `protect/FileControl.java` | `/api/protect/files/` | upload, delete | 🟡中 | 6日 |
| `protect/DraftControl.java` | `/api/protect/drafts/` | save, list | 🟡中 | 4日 |
| `protect/NotificationControl.java` | `/api/protect/notifications/` | list, read | 🟡中 | 5日 |
| `protect/EventControl.java` | `/api/protect/events/` | create, manage | 🟢低 | 6日 |
| `protect/SurveyControl.java` | `/api/protect/surveys/` | create, answers | 🟢低 | 8日 |
| `protect/ConfigControl.java` | `/api/protect/config/` | settings | 🟢低 | 3日 |
| `protect/NotifyControl.java` | `/api/protect/notify/` | settings | 🟢低 | 3日 |
| `protect/TokenControl.java` | `/api/protect/tokens/` | manage | 🟢低 | 2日 |
| `protect/TargetControl.java` | `/api/protect/targets/` | settings | 🟢低 | 2日 |
| `protect/ConnectControl.java` | `/api/protect/connect/` | external | 🟢低 | 3日 |

### C. Admin Controllers (16クラス) - 管理API
| 旧Java Controller | 新API Route | 主要メソッド | 優先度 | 工数 |
|------------------|-------------|-------------|--------|------|
| `admin/UsersControl.java` | `/api/admin/users/` | list, create, edit, accept | 🟡中 | 8日 |
| `admin/SystemConfigControl.java` | `/api/admin/system/` | config, save | 🟡中 | 4日 |
| `admin/TemplateControl.java` | `/api/admin/templates/` | list, edit | 🟡中 | 6日 |
| `admin/NoticeControl.java` | `/api/admin/notices/` | create, manage | 🟡中 | 3日 |
| `admin/ConfigControl.java` | `/api/admin/config/` | system, analytics | 🟢低 | 5日 |
| `admin/DatabaseControl.java` | `/api/admin/database/` | backup, restore, reindex | 🟢低 | 8日 |
| `admin/MailControl.java` | `/api/admin/mail/` | config | 🟢低 | 4日 |
| `admin/MailTemplateControl.java` | `/api/admin/mail-templates/` | manage | 🟢低 | 4日 |
| `admin/MailhookControl.java` | `/api/admin/mailhooks/` | config | 🟢低 | 5日 |
| `admin/WebhookControl.java` | `/api/admin/webhooks/` | config | 🟢低 | 4日 |
| `admin/LdapControl.java` | `/api/admin/ldap/` | config | 🟢低 | 4日 |
| `admin/ProxyControl.java` | `/api/admin/proxy/` | config | 🟢低 | 2日 |
| `admin/LoggingControl.java` | `/api/admin/logging/` | view | 🟢低 | 3日 |
| `admin/AggregateControl.java` | `/api/admin/aggregate/` | stats | 🟢低 | 5日 |
| `admin/PinControl.java` | `/api/admin/pins/` | manage | 🟢低 | 2日 |
| `admin/CustomServiceControl.java` | `/api/admin/custom/` | config | 🟢低 | 3日 |

### D. API Controllers (5クラス) - 専用API
| 旧Java Controller | 新API Route | 主要メソッド | 優先度 | 工数 |
|------------------|-------------|-------------|--------|------|
| `api/KnowledgesControl.java` | `/api/v1/knowledges/` | CRUD API | 🔴高 | 8日 |
| `api/GroupsControl.java` | `/api/v1/groups/` | CRUD API | 🟡中 | 5日 |
| `api/UsersControl.java` | `/api/v1/users/` | CRUD API | 🟡中 | 5日 |
| `api/AttachControl.java` | `/api/v1/attachments/` | file API | 🟡中 | 4日 |
| `api/SampleControl.java` | `/api/v1/samples/` | test API | 🟢低 | 1日 |

## 📁 DAO移植計画

### 主要DAOクラス (54クラス)
```typescript
// 移植例：KnowledgesDao.java → knowledgeRepository.ts
export class KnowledgeRepository {
  async findById(id: bigint): Promise<Knowledge | null> {
    return await prisma.knowledge.findUnique({
      where: { knowledgeId: id },
      include: {
        author: true,
        tags: true,
        files: true,
        comments: true
      }
    });
  }
  
  async search(params: SearchParams): Promise<Knowledge[]> {
    return await prisma.knowledge.findMany({
      where: {
        title: { contains: params.keyword },
        publicFlag: PublicFlag.PUBLIC,
        deleteFlag: 0
      },
      orderBy: { insertDatetime: 'desc' }
    });
  }
}
```

### DAO → Repository変換表
| 旧DAO | 新Repository | テーブル | 優先度 |
|-------|-------------|----------|--------|
| `KnowledgesDao.java` | `knowledgeRepository.ts` | knowledges | 🔴高 |
| `UsersDao.java` | `userRepository.ts` | users | 🔴高 |
| `TagsDao.java` | `tagRepository.ts` | tags | 🔴高 |
| `CommentsDao.java` | `commentRepository.ts` | comments | 🔴高 |
| `GroupsDao.java` | `groupRepository.ts` | groups | 🟡中 |
| `LikesDao.java` | `likeRepository.ts` | likes | 🟡中 |
| `StocksDao.java` | `stockRepository.ts` | stocks | 🟡中 |
| *他48クラス* | *対応Repository* | *各テーブル* | 🟢低 |

## 🧠 Logic移植計画

### Core Logic Classes (40+クラス)
```typescript
// 移植例：KnowledgeLogic.java → knowledgeService.ts
export class KnowledgeService {
  private knowledgeRepo = new KnowledgeRepository();
  
  async createKnowledge(data: CreateKnowledgeInput, user: User): Promise<Knowledge> {
    // バリデーション
    await this.validateKnowledgeData(data);
    
    // 権限チェック
    await this.checkCreatePermission(user, data.groupIds);
    
    // 保存処理
    return await this.knowledgeRepo.create({
      ...data,
      insertUser: user.id,
      insertDatetime: new Date()
    });
  }
  
  async updateKnowledge(id: bigint, data: UpdateKnowledgeInput, user: User): Promise<Knowledge> {
    // 既存データ取得
    const existing = await this.knowledgeRepo.findById(id);
    if (!existing) throw new NotFoundError();
    
    // 編集権限チェック
    await this.checkEditPermission(user, existing);
    
    // 履歴作成
    await this.createHistory(existing, user);
    
    // 更新処理
    return await this.knowledgeRepo.update(id, {
      ...data,
      updateUser: user.id,
      updateDatetime: new Date()
    });
  }
}
```

### Logic → Service変換表
| 旧Logic | 新Service | 機能 | 優先度 |
|---------|-----------|------|--------|
| `KnowledgeLogic.java` | `knowledgeService.ts` | ナレッジ処理 | 🔴高 |
| `AccountLogic.java` | `accountService.ts` | アカウント処理 | 🔴高 |
| `GroupLogic.java` | `groupService.ts` | グループ処理 | 🟡中 |
| `UploadedFileLogic.java` | `fileService.ts` | ファイル処理 | 🟡中 |
| `NotificationLogic.java` | `notificationService.ts` | 通知処理 | 🟡中 |
| `MailLogic.java` | `mailService.ts` | メール処理 | 🟡中 |
| `TagLogic.java` | `tagService.ts` | タグ処理 | 🟡中 |
| `MarkdownLogic.java` | `markdownService.ts` | Markdown処理 | 🟡中 |
| *他32クラス* | *対応Service* | *各機能* | 🟢低 |

## 🔐 認証・認可システム移植

### Java認証機能分析
```java
// 旧: KnowledgeAuthenticationLogic.java
public boolean canEdit(KnowledgesEntity knowledge, LoginedUser user) {
    // 作成者チェック
    if (knowledge.getInsertUser().equals(user.getUserId())) return true;
    
    // 管理者チェック
    if (user.isAdmin()) return true;
    
    // 編集権限ユーザーチェック
    // グループ編集権限チェック
    // 公開範囲チェック
}
```

### Next.js認証実装
```typescript
// 新: authService.ts + middleware.ts
export class AuthService {
  async canEditKnowledge(knowledgeId: bigint, user: User): Promise<boolean> {
    const knowledge = await knowledgeRepo.findById(knowledgeId);
    if (!knowledge) return false;
    
    // 作成者チェック
    if (knowledge.insertUser === user.id) return true;
    
    // 管理者チェック
    if (user.isAdmin) return true;
    
    // 編集権限チェック
    return await this.checkEditPermissions(knowledge, user);
  }
}

// middleware.ts - API Route保護
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/protect/')) {
    return withAuth(request);
  }
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    return withAdminAuth(request);
  }
}
```

## 📊 データ移行計画

### 1. Prismaスキーマ完全対応
```prisma
// 78テーブル完全定義
model Knowledge {
  knowledgeId    BigInt    @id @default(autoincrement()) @map("knowledge_id")
  title          String    @db.VarChar(1024)
  content        String?
  publicFlag     Int?      @map("public_flag")
  // ... 全フィールド定義
  
  // リレーション定義
  author         User?     @relation("KnowledgeAuthor", fields: [insertUser], references: [userId])
  tags           KnowledgeTag[]
  files          KnowledgeFile[]
  comments       Comment[]
  likes          Like[]
  stocks         StockKnowledge[]
  
  @@map("knowledges")
}
```

### 2. 複雑クエリ移植
```typescript
// 旧: 複雑なSQL (KnowledgesDao.java)
String sql = `
  SELECT k.*, u.user_name, 
         (SELECT COUNT(*) FROM likes l WHERE l.knowledge_id = k.knowledge_id) as like_count
  FROM knowledges k 
  LEFT JOIN users u ON k.insert_user = u.user_id 
  WHERE k.delete_flag = 0 
    AND (k.public_flag = 1 OR (k.public_flag = 2 AND EXISTS(...)))
  ORDER BY k.insert_datetime DESC
`;

// 新: Prisma Query (knowledgeRepository.ts)
async searchKnowledges(params: SearchParams, user?: User): Promise<Knowledge[]> {
  return await prisma.knowledge.findMany({
    where: {
      deleteFlag: 0,
      OR: [
        { publicFlag: PublicFlag.PUBLIC },
        user ? {
          publicFlag: PublicFlag.PROTECT,
          OR: [
            { insertUser: user.id },
            { groups: { some: { group: { users: { some: { userId: user.id } } } } } }
          ]
        } : {}
      ],
      title: params.keyword ? { contains: params.keyword } : undefined
    },
    include: {
      author: { select: { userName: true } },
      _count: { select: { likes: true } }
    },
    orderBy: { insertDatetime: 'desc' }
  });
}
```

## 🔄 段階的実装計画

### Phase 1: Core API (4週間)
**目標**: 基本CRUD・認証API完成
```
Week 1: 認証システム (/api/auth/, /api/open/signup/, /api/open/password/)
Week 2: ナレッジAPI (/api/open/knowledge/, /api/protect/knowledge/)
Week 3: ユーザー・アカウントAPI (/api/open/account/, /api/protect/account/)
Week 4: ファイル・タグAPI (/api/open/files/, /api/open/tags/)
```

### Phase 2: Social API (3週間)
**目標**: ソーシャル機能API完成
```
Week 1: いいね・コメントAPI (/api/protect/likes/, /api/protect/comments/)
Week 2: ストック・グループAPI (/api/protect/stocks/, /api/protect/groups/)
Week 3: 通知API (/api/protect/notifications/)
```

### Phase 3: Advanced API (3週間)
**目標**: 高度機能API完成
```
Week 1: 下書き・履歴API (/api/protect/drafts/, /api/open/knowledge/history/)
Week 2: 検索・集計API (/api/v1/search/, /api/admin/aggregate/)
Week 3: イベント・アンケートAPI (/api/protect/events/, /api/protect/surveys/)
```

### Phase 4: Admin API (2週間)
**目標**: 管理機能API完成
```
Week 1: ユーザー管理・システム設定API (/api/admin/users/, /api/admin/system/)
Week 2: その他管理API (/api/admin/*)
```

### Phase 5: Integration & Performance (2週間)
**目標**: 統合・最適化
```
Week 1: バッチ処理・メール・Webhook実装
Week 2: パフォーマンス最適化・テスト完全化
```

## 🧪 TDD実装戦略

### 1. API Route TDD
```typescript
// knowledgeApi.test.ts
describe('/api/open/knowledge', () => {
  describe('GET /api/open/knowledge/[id]', () => {
    test('should return knowledge by id', async () => {
      const response = await request(app).get('/api/open/knowledge/1');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        knowledgeId: 1,
        title: expect.any(String),
        content: expect.any(String)
      });
    });
    
    test('should return 404 for non-existent knowledge', async () => {
      const response = await request(app).get('/api/open/knowledge/999999');
      expect(response.status).toBe(404);
    });
  });
});
```

### 2. Service Layer TDD
```typescript
// knowledgeService.test.ts
describe('KnowledgeService', () => {
  describe('createKnowledge', () => {
    test('should create knowledge with valid data', async () => {
      const knowledge = await knowledgeService.createKnowledge({
        title: 'Test Knowledge',
        content: 'Test content'
      }, mockUser);
      
      expect(knowledge.title).toBe('Test Knowledge');
      expect(knowledge.insertUser).toBe(mockUser.id);
    });
  });
});
```

### 3. Repository TDD
```typescript
// knowledgeRepository.test.ts
describe('KnowledgeRepository', () => {
  test('should find knowledge by id', async () => {
    const knowledge = await knowledgeRepo.findById(BigInt(1));
    expect(knowledge).not.toBeNull();
    expect(knowledge?.knowledgeId).toBe(BigInt(1));
  });
});
```

## 📈 進捗管理・品質保証

### 1. 完了定義 (Definition of Done)
各APIエンドポイント完了時の必須条件：
- [ ] TDD完全実装（単体・統合テスト）
- [ ] 旧Javaシステムとの機能同等性確認
- [ ] API仕様書更新
- [ ] エラーハンドリング完備
- [ ] 認証・認可チェック実装
- [ ] パフォーマンステスト通過
- [ ] コードレビュー完了

### 2. 品質指標
- **テストカバレッジ**: 90%以上
- **APIレスポンス時間**: 500ms以下
- **エラー率**: 1%以下
- **セキュリティチェック**: 全項目パス

### 3. リスク管理
- **技術リスク**: 複雑クエリ性能劣化 → 早期プロトタイプ検証
- **データリスク**: 移行時データ損失 → 段階的移行・バックアップ
- **互換性リスク**: 既存フロントエンドとの不整合 → API契約テスト
- **スキーマ不整合リスク**: Prismaスキーマ・TypeScript型定義・実DB構造の不一致 → 厳密な同期手順遵守

### 4. スキーマ同期管理 🔧

#### 4.1. データソース優先順位（厳守）
```
1. 最優先: knowledge_schema.sql（実データベース構造）
2. 修正対象: prisma/schema.prisma
3. 修正対象: TypeScript型定義（src/types/*.ts）
```

#### 4.2. スキーマ変更時の必須手順
```bash
# 1. 実DBスキーマ確認
grep -A 20 "CREATE TABLE target_table" knowledge_schema.sql

# 2. Prismaスキーマ修正
vim nextjs/prisma/schema.prisma

# 3. TypeScript型定義修正
vim nextjs/src/types/index.ts

# 4. Prismaクライアント再生成
cd nextjs && npx prisma generate

# 5. Next.jsキャッシュクリア
rm -rf .next

# 6. 動作確認テスト実行
npm test && npm run build
```

#### 4.3. 禁止事項
- ❌ `knowledge_schema.sql`の修正（実DBが変更不可のため）
- ❌ 古い型定義の放置（`anonymous`カラム事件の再発防止）
- ❌ Prismaスキーマとコード内型定義の不整合放置
- ❌ スキーマ変更後のPrismaクライアント再生成忘れ

#### 4.4. チェックリスト
各API実装時・スキーマ変更時の必須確認事項：
- [ ] `knowledge_schema.sql`とPrismaスキーマの完全一致
- [ ] TypeScript型定義とPrismaスキーマの一致
- [ ] 存在しないカラム（`anonymous`等）の削除確認
- [ ] `npx prisma generate`実行済み
- [ ] 開発サーバー正常起動
- [ ] APIエンドポイント正常動作

---

## 📚 関連ドキュメント

- [PAGE_MIGRATION_PLAN.md](./PAGE_MIGRATION_PLAN.md) - フロントエンド移植計画
- [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) - 全体移植計画
- [PROGRESS.md](./PROGRESS.md) - 進捗記録

---

**最終更新**: 2025-07-14  
**策定者**: Claude Code  
**承認**: 要確認