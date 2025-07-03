#!/bin/bash

# Knowledge管理システム コンテナベースセットアップスクリプト

echo "🚀 Knowledge管理システム セットアップを開始します..."
echo "📝 このスクリプトは完全にコンテナベースで動作し、ローカルにPHP/Composer/Nodeをインストールする必要はありません"
echo ""

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 成功・失敗のマーク
SUCCESS="✅"
FAILED="❌"
WARNING="⚠️"
INFO="ℹ️"

# エラーカウンター
ERROR_COUNT=0

# 関数: ステップの実行
run_step() {
    echo -e "${BLUE}${INFO} $1${NC}"
    if eval "$2"; then
        echo -e "${GREEN}${SUCCESS} $1 完了${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}${FAILED} $1 失敗${NC}"
        ((ERROR_COUNT++))
        echo ""
        return 1
    fi
}

# 関数: 情報の表示
show_info() {
    echo -e "${BLUE}${INFO} $1${NC}"
}

# 関数: 警告の表示
show_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

echo "📋 ステップ 1: 前提条件の確認"
echo "=========================================="

# Dockerの確認
if ! command -v docker &> /dev/null; then
    echo -e "${RED}${FAILED} Docker がインストールされていません${NC}"
    echo "Docker Desktop をインストールしてください: https://docs.docker.com/get-docker/"
    exit 1
fi

# Docker Composeの確認
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}${FAILED} Docker Compose がインストールされていません${NC}"
    echo "Docker Compose をインストールしてください"
    exit 1
fi

echo -e "${GREEN}${SUCCESS} Docker環境確認完了${NC}"
echo ""

echo "📋 ステップ 2: 環境設定ファイルの準備"
echo "=========================================="

if [ ! -f ".env" ]; then
    run_step "環境設定ファイルをコピー" "cp .env.example .env"
else
    show_info ".env ファイルは既に存在します"
fi

echo "📋 ステップ 3: 依存関係のインストール"
echo "=========================================="

run_step "Composer依存関係のインストール" "docker-compose --profile setup run --rm composer"

run_step "NPM依存関係のインストールとビルド" "docker-compose --profile setup run --rm npm"

echo "📋 ステップ 4: Docker環境の起動"
echo "=========================================="

run_step "Dockerコンテナの起動" "docker-compose up -d --build"

# サービスの起動を待機
show_info "サービスの起動を待機中..."
sleep 10

echo "📋 ステップ 5: Laravel初期化"
echo "=========================================="

run_step "アプリケーションキーの生成" "docker-compose exec app php artisan key:generate"

run_step "ストレージリンクの作成" "docker-compose exec app php artisan storage:link"

run_step "データベースマイグレーション" "docker-compose exec app php artisan migrate"

run_step "サンプルデータの投入" "docker-compose exec app php artisan db:seed"

echo "📋 ステップ 6: 検索機能の初期化"
echo "=========================================="

run_step "Meilisearch検索インデックスの作成" "docker-compose exec app php artisan scout:import \"App\\Models\\Knowledge\\Knowledge\""

echo "📋 ステップ 7: 権限の設定"
echo "=========================================="

run_step "ストレージディレクトリの権限設定" "docker-compose exec app chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache"

run_step "ストレージディレクトリの権限設定（詳細）" "docker-compose exec app chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache"

echo ""
echo "🎉 セットアップ完了チェック"
echo "=========================================="

# ヘルスチェック
show_info "サービスの状態を確認中..."

# PostgreSQL接続確認
if docker-compose exec postgres pg_isready -U sail -d knowledge_laravel > /dev/null 2>&1; then
    echo -e "${GREEN}${SUCCESS} PostgreSQL接続確認${NC}"
else
    echo -e "${RED}${FAILED} PostgreSQL接続確認${NC}"
    ((ERROR_COUNT++))
fi

# Redis接続確認
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}${SUCCESS} Redis接続確認${NC}"
else
    echo -e "${RED}${FAILED} Redis接続確認${NC}"
    ((ERROR_COUNT++))
fi

# Meilisearch接続確認
if docker-compose exec meilisearch wget --no-verbose --spider http://127.0.0.1:7700/health > /dev/null 2>&1; then
    echo -e "${GREEN}${SUCCESS} Meilisearch接続確認${NC}"
else
    echo -e "${RED}${FAILED} Meilisearch接続確認${NC}"
    ((ERROR_COUNT++))
fi

# Webアプリケーション接続確認
sleep 5
if curl -f http://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}${SUCCESS} Webアプリケーション接続確認${NC}"
else
    echo -e "${RED}${FAILED} Webアプリケーション接続確認${NC}"
    ((ERROR_COUNT++))
fi

echo ""

# 結果表示
if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 セットアップが正常に完了しました！${NC}"
    echo ""
    echo "🌐 アクセス情報:"
    echo "----------------------------------------"
    echo "メインアプリケーション: http://localhost"
    echo "Meilisearch管理画面:   http://localhost:7700"
    echo "Mailpit (メール確認):   http://localhost:8025"
    echo ""
    echo "👤 ログイン情報:"
    echo "----------------------------------------"
    echo "管理者: admin / password"
    echo "ユーザー1: user1 / password"
    echo "ユーザー2: user2 / password"
    echo ""
    echo "🔧 開発コマンド:"
    echo "----------------------------------------"
    echo "フロントエンド開発サーバー:"
    echo "  docker-compose exec app npm run dev"
    echo ""
    echo "Laravelコマンド実行:"
    echo "  docker-compose exec app php artisan [command]"
    echo ""
    echo "ログ確認:"
    echo "  docker-compose logs app"
    echo ""
    echo "コンテナ停止:"
    echo "  docker-compose down"
    echo ""
else
    echo -e "${RED}⚠️  セットアップ中に $ERROR_COUNT 個のエラーが発生しました${NC}"
    echo ""
    echo "トラブルシューティング:"
    echo "----------------------------------------"
    echo "1. ポート競合確認: sudo lsof -i :80,5432,7700"
    echo "2. Docker再起動: docker-compose down && docker-compose up -d --build"
    echo "3. ログ確認: docker-compose logs"
    echo "4. 詳細確認スクリプト実行: ./scripts/check-docker-setup.sh"
    echo ""
fi

echo "📚 詳細な手順については README.md を参照してください。"