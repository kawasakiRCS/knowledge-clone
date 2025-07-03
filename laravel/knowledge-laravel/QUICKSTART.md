# 🚀 Knowledge管理システム クイックスタートガイド

このガイドに従って、5分でKnowledge管理システムを起動できます。

## ⚡ 最速セットアップ（3分）

> **重要**: このシステムは完全にコンテナベースで動作します。ローカルにPHP、Composer、Node.jsをインストールする必要はありません。

### 1. 自動セットアップ（推奨）

```bash
# 自動セットアップスクリプト実行
./scripts/setup.sh
```

これだけで完了です！

### 2. 手動セットアップ

```bash
# 環境設定ファイルをコピー
cp .env.example .env

# 依存関係インストール（コンテナベース）
docker-compose --profile setup run --rm composer
docker-compose --profile setup run --rm npm

# Docker環境起動
docker-compose up -d --build

# アプリケーション初期化
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed

# 検索インデックス作成
docker-compose exec app php artisan scout:import "App\Models\Knowledge\Knowledge"
```

### 3. 動作確認

```bash
# セットアップ状況を確認
./scripts/check-docker-setup.sh
```

### 4. アクセス

ブラウザで以下にアクセス：

- **メインアプリケーション**: http://localhost
- **Meilisearch管理画面**: http://localhost:7700

### 5. ログイン

以下のアカウントでログインできます：

| 役割 | ユーザー名 | パスワード |
|------|-----------|-----------|
| 管理者 | `admin` | `password` |
| 一般ユーザー1 | `user1` | `password` |
| 一般ユーザー2 | `user2` | `password` |

## 🎯 主要機能の確認

### ナレッジ管理
1. **ナレッジ一覧**: トップページまたは「ナレッジ」メニュー
2. **ナレッジ作成**: 「新規作成」ボタン
3. **検索機能**: ヘッダーの検索ボックス
4. **タグ機能**: タグをクリックして関連ナレッジを表示

### コメント機能
1. ナレッジ詳細ページでコメント追加
2. いいね機能の確認
3. 匿名コメント機能

### 検索機能
1. **基本検索**: 検索ボックスにキーワード入力
2. **高度な検索**: 検索ページで詳細フィルター
3. **サジェスト機能**: 検索入力時の候補表示

## 🔧 開発モード

フロントエンド開発時は以下のコマンドでホットリロードを有効にできます：

```bash
# 開発サーバー起動
docker-compose exec app npm run dev
```

別ターミナルでアクセス: http://localhost:5173

## 🚨 トラブルシューティング

### よくある問題

#### ポート競合エラー
```bash
# 使用中のポートを確認
sudo lsof -i :80,5432,7700

# 他のサービスを停止するか、docker-compose.ymlでポート変更
```

#### パーミッションエラー
```bash
# ストレージディレクトリの権限修正
docker-compose exec app chown -R www-data:www-data storage/
```

#### データベース接続エラー
```bash
# PostgreSQLコンテナ再起動
docker-compose restart postgres
```

#### フロントエンドが表示されない
```bash
# Node.js依存関係再インストール
docker-compose exec app rm -rf node_modules
docker-compose exec app npm install
docker-compose exec app npm run build
```

### ログ確認

```bash
# Laravelアプリケーションログ
docker-compose logs app

# データベースログ  
docker-compose logs postgres

# 検索エンジンログ
docker-compose logs meilisearch
```

## 📱 サンプルデータ

自動的に以下のサンプルデータが作成されます：

- **ユーザー**: 管理者1名、一般ユーザー2名
- **テンプレート**: 5種類（技術ドキュメント、FAQ、手順書など）
- **ナレッジ**: 5件のサンプル記事
- **タグ**: 10個の技術関連タグ
- **コメント**: 各ナレッジに複数のコメント

## 🎓 次のステップ

システムが正常に動作したら：

1. **README.md** を読んで詳細な機能を確認
2. **新しいナレッジを作成**してみる
3. **検索機能**をテストする
4. **コメント・いいね機能**を試す
5. **ファイルアップロード**機能を確認

## 🆘 サポート

問題が発生した場合：

1. `./scripts/check-setup.sh` でシステム状態を確認
2. README.mdのトラブルシューティングセクションを確認
3. GitHubのIssueで報告

---

**🎉 セットアップ完了！ナレッジ管理システムをお楽しみください！**