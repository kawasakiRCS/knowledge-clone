# Knowledge管理システム (Laravel版)

Java版から移行したモダンな知識管理システムです。Laravel 11 + Vue.js 3 + TypeScript + Inertia.jsで構築されています。

## 🚀 クイックスタート

### 前提条件

- **Docker & Docker Compose のみ**
- Git

> **重要**: このシステムは完全にコンテナベースで動作します。ローカルにPHP、Composer、Node.jsをインストールする必要はありません。

### 1. 自動セットアップ（推奨）

```bash
# リポジトリをクローン
git clone <repository-url>
cd knowledge-laravel

# 自動セットアップスクリプト実行
./scripts/setup.sh
```

### 2. 手動セットアップ

```bash
# 環境設定ファイルをコピー
cp .env.example .env

# 依存関係のインストール（コンテナベース）
docker-compose --profile setup run --rm composer
docker-compose --profile setup run --rm npm

# Dockerコンテナを起動
docker-compose up -d --build

# Laravel初期化
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed

# 検索インデックス作成
docker-compose exec app php artisan scout:import "App\Models\Knowledge\Knowledge"
```

### 3. アクセス確認

ブラウザで以下にアクセス：
- **アプリケーション**: http://localhost
- **Meilisearch**: http://localhost:7700
- **Mailpit (メール確認)**: http://localhost:8025
- **PostgreSQL**: localhost:5432

### 4. 初期ログイン

自動セットアップでサンプルユーザーが作成されます：

| 役割 | ユーザー名 | パスワード |
|------|-----------|-----------|
| 管理者 | `admin` | `password` |
| 一般ユーザー1 | `user1` | `password` |
| 一般ユーザー2 | `user2` | `password` |

## 📁 プロジェクト構成

```
knowledge-laravel/
├── app/
│   ├── Http/Controllers/        # コントローラー
│   ├── Models/                  # Eloquentモデル
│   │   ├── Knowledge/          # ナレッジ関連モデル
│   │   └── Web/                # ユーザー・グループ関連
│   └── Services/               # ビジネスロジック
├── resources/
│   ├── js/                     # Vue.js コンポーネント
│   │   ├── Components/         # 共通コンポーネント
│   │   ├── Pages/              # ページコンポーネント
│   │   └── types/              # TypeScript型定義
│   └── views/                  # Bladeテンプレート
├── routes/
│   ├── web.php                 # Web ルート
│   └── api.php                 # API ルート
└── docker-compose.yml          # Docker設定
```

## 🛠 開発環境

### Docker Composeコマンド

```bash
# コンテナ起動
docker-compose up -d

# コンテナ停止
docker-compose down

# Laravelコマンド実行
docker-compose exec app php artisan [command]

# Composerコマンド実行
docker-compose exec app composer [command]

# NPMコマンド実行
docker-compose exec app npm [command]

# データベースアクセス
docker-compose exec postgres psql -U sail -d knowledge_laravel
```

### フロントエンド開発

```bash
# 開発サーバー起動（ホットリロード有効）
docker-compose exec app npm run dev

# 本番用ビルド
docker-compose exec app npm run build

# TypeScript型チェック
docker-compose exec app npm run type-check
```

## 🗄 データベース

### 接続情報

- **ホスト**: postgres (Docker内) / localhost (外部から)
- **ポート**: 5432
- **データベース名**: knowledge_laravel
- **ユーザー名**: sail
- **パスワード**: password

### マイグレーション

```bash
# マイグレーション実行
docker-compose exec app php artisan migrate

# マイグレーション状態確認
docker-compose exec app php artisan migrate:status

# ロールバック
docker-compose exec app php artisan migrate:rollback

# フレッシュマイグレーション（データ削除注意）
docker-compose exec app php artisan migrate:fresh
```

### シーダー実行

```bash
# サンプルデータ投入
docker-compose exec app php artisan db:seed

# 特定のシーダー実行
docker-compose exec app php artisan db:seed --class=KnowledgeSeeder
```

## 🔍 検索機能 (Meilisearch)

### 検索インデックス設定

```bash
# Scout設定
docker-compose exec app php artisan scout:import "App\Models\Knowledge\Knowledge"

# インデックス削除・再構築
docker-compose exec app php artisan scout:flush "App\Models\Knowledge\Knowledge"
docker-compose exec app php artisan scout:import "App\Models\Knowledge\Knowledge"
```

### Meilisearch管理画面

http://localhost:7700 でアクセス可能

## 📝 テストデータ作成

### サンプルナレッジ作成

自動セットアップ（`./scripts/setup.sh`）でサンプルデータが作成されます。
手動で作成する場合：

```bash
docker-compose exec app php artisan tinker
```

```php
// 管理者ユーザー作成
$admin = User::create([
    'user_key' => 'admin',
    'user_name' => '管理者',
    'mail_address' => 'admin@example.com',
    'password' => bcrypt('password'),
    'auth_ldap' => 0
]);

// テンプレート作成
$template = TemplateMaster::create([
    'type_name' => '技術ドキュメント',
    'type_icon' => '📚',
    'description' => '技術的な内容のドキュメント',
    'insert_user' => $admin->user_id,
    'update_user' => $admin->user_id
]);

// サンプルナレッジ作成
Knowledge::create([
    'title' => 'Laravel環境構築ガイド',
    'content' => 'このドキュメントではLaravelの環境構築について説明します。',
    'public_flag' => 1,
    'type_id' => $template->type_id,
    'anonymous' => 0,
    'notify_status' => 0,
    'point' => 0,
    'insert_user' => $admin->user_id,
    'update_user' => $admin->user_id
]);
```

または、シーダーを使用：

```bash
docker-compose exec app php artisan db:seed --class=KnowledgeSeeder
```

## 🔧 設定ファイル

### 重要な環境変数 (.env)

```env
APP_NAME="Knowledge管理システム"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

# データベース設定
DB_CONNECTION=pgsql
DB_HOST=pgsql
DB_PORT=5432
DB_DATABASE=knowledge_laravel
DB_USERNAME=sail
DB_PASSWORD=password

# Meilisearch設定
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_KEY=

# Redis設定
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# ファイルストレージ設定
FILESYSTEM_DISK=local

# セッション設定
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# キャッシュ設定
CACHE_DRIVER=redis
```

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. コンテナが起動しない

```bash
# ポート競合確認
docker ps
sudo lsof -i :80,5432,7700

# Dockerリソースクリア
./vendor/bin/sail down
docker system prune -f
./vendor/bin/sail up -d
```

#### 2. データベース接続エラー

```bash
# PostgreSQLコンテナ状態確認
./vendor/bin/sail exec pgsql pg_isready

# データベース再作成
./vendor/bin/sail artisan migrate:fresh
```

#### 3. 検索機能が動作しない

```bash
# Meilisearchコンテナ確認
./vendor/bin/sail exec meilisearch curl -f http://localhost:7700/health

# インデックス再構築
./vendor/bin/sail artisan scout:flush "App\Models\Knowledge\Knowledge"
./vendor/bin/sail artisan scout:import "App\Models\Knowledge\Knowledge"
```

#### 4. フロントエンドが表示されない

```bash
# Node.jsモジュール再インストール
./vendor/bin/sail exec laravel.test rm -rf node_modules
./vendor/bin/sail npm install
./vendor/bin/sail npm run build
```

#### 5. ファイルアップロードエラー

```bash
# ストレージディレクトリ権限確認
./vendor/bin/sail exec laravel.test ls -la storage/
./vendor/bin/sail artisan storage:link
```

#### 6. 認証エラー

```bash
# アプリケーションキー再生成
./vendor/bin/sail artisan key:generate

# セッションクリア
./vendor/bin/sail artisan session:table
./vendor/bin/sail artisan migrate
```

### ログ確認

```bash
# Laravelログ
./vendor/bin/sail exec laravel.test tail -f storage/logs/laravel.log

# PostgreSQLログ
./vendor/bin/sail exec pgsql tail -f /var/log/postgresql/postgresql-main.log

# Meilisearchログ
./vendor/bin/sail logs meilisearch
```

## 🔐 セキュリティ

### 本番環境での設定

1. **環境変数の設定**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=<32文字のランダム文字列>
   ```

2. **データベースパスワード変更**
3. **HTTPSの有効化**
4. **ファイルアップロード制限の設定**

## 📚 API ドキュメント

### 主要エンドポイント

| エンドポイント | メソッド | 説明 |
|---------------|----------|------|
| `/api/knowledge` | GET | ナレッジ一覧取得 |
| `/api/knowledge/{id}` | GET | ナレッジ詳細取得 |
| `/api/search` | GET | ナレッジ検索 |
| `/api/comments` | GET/POST | コメント取得・投稿 |
| `/api/files/upload` | POST | ファイルアップロード |

## 🤝 開発ガイドライン

### コードスタイル

```bash
# PHP CS Fixer (今後追加予定)
./vendor/bin/sail exec laravel.test ./vendor/bin/php-cs-fixer fix

# ESLint + Prettier (今後追加予定)
./vendor/bin/sail npm run lint
```

### テスト実行

```bash
# PHPUnitテスト実行
./vendor/bin/sail test

# 特定のテストクラス実行
./vendor/bin/sail test tests/Feature/KnowledgeTest.php

# カバレッジ付きテスト実行
./vendor/bin/sail test --coverage
```

## 📞 サポート

問題が発生した場合は、GitHubのIssueで報告してください。

---

**開発者**: Knowledge Development Team  
**最終更新**: 2025年7月3日
