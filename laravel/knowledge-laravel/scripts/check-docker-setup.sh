#!/bin/bash

# Knowledge管理システム Docker環境確認スクリプト

echo "🐳 Knowledge管理システム Docker環境確認を開始します..."
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

# 関数: チェック結果の表示
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}${SUCCESS} $2${NC}"
    else
        echo -e "${RED}${FAILED} $2${NC}"
        ((ERROR_COUNT++))
    fi
}

# 関数: 警告の表示
show_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

# 関数: 情報の表示
show_info() {
    echo -e "${BLUE}${INFO} $1${NC}"
}

echo "1. 🐳 Docker環境確認"
echo "----------------------------------------"

# Dockerの確認
docker --version > /dev/null 2>&1
check_result $? "Docker インストール確認"

# Docker Composeの確認
docker-compose --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    docker compose version > /dev/null 2>&1
    check_result $? "Docker Compose インストール確認"
else
    check_result 0 "Docker Compose インストール確認"
fi

# Dockerデーモンの確認
docker info > /dev/null 2>&1
check_result $? "Docker デーモン起動確認"

echo ""

echo "2. 📦 コンテナ状態確認"
echo "----------------------------------------"

# コンテナの存在確認
containers=("knowledge-app" "knowledge-postgres" "knowledge-redis" "knowledge-meilisearch" "knowledge-mailpit")

for container in "${containers[@]}"; do
    if docker ps -a --format "table {{.Names}}" | grep -q "^${container}$"; then
        if docker ps --format "table {{.Names}}" | grep -q "^${container}$"; then
            check_result 0 "コンテナ起動確認: $container"
        else
            check_result 1 "コンテナ起動確認: $container (存在するが停止中)"
        fi
    else
        check_result 1 "コンテナ存在確認: $container"
    fi
done

echo ""

echo "3. 🌐 ネットワーク接続確認"
echo "----------------------------------------"

# PostgreSQL接続確認
if docker-compose exec -T postgres pg_isready -U sail -d knowledge_laravel > /dev/null 2>&1; then
    check_result 0 "PostgreSQL 接続確認"
else
    check_result 1 "PostgreSQL 接続確認"
fi

# Redis接続確認
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    check_result 0 "Redis 接続確認"
else
    check_result 1 "Redis 接続確認"
fi

# Meilisearch接続確認
if docker-compose exec -T meilisearch wget --no-verbose --spider http://127.0.0.1:7700/health > /dev/null 2>&1; then
    check_result 0 "Meilisearch 接続確認"
else
    check_result 1 "Meilisearch 接続確認"
fi

echo ""

echo "4. 🌍 外部アクセス確認"
echo "----------------------------------------"

# ポート確認
ports=(80 5432 6379 7700 8025)
for port in "${ports[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        check_result 0 "ポート $port 使用確認"
    else
        check_result 1 "ポート $port 使用確認"
    fi
done

# HTTP接続テスト
if curl -f http://localhost > /dev/null 2>&1; then
    check_result 0 "HTTP アクセス確認 (http://localhost)"
else
    check_result 1 "HTTP アクセス確認 (http://localhost)"
fi

echo ""

echo "5. 📁 ファイル・ディレクトリ確認"
echo "----------------------------------------"

# 重要なファイルの存在確認
files=(
    ".env"
    "docker-compose.yml"
    "Dockerfile"
    "composer.json"
    "package.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        check_result 0 "ファイル存在確認: $file"
    else
        check_result 1 "ファイル存在確認: $file"
    fi
done

# ディレクトリの確認
directories=("vendor" "node_modules" "storage" "bootstrap/cache")

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        check_result 0 "ディレクトリ存在確認: $dir"
    else
        check_result 1 "ディレクトリ存在確認: $dir"
    fi
done

echo ""

echo "6. ⚙️ Laravel アプリケーション確認"
echo "----------------------------------------"

# .env ファイルの重要設定確認
if [ -f ".env" ]; then
    # APP_KEY
    if grep -q "APP_KEY=base64:" .env; then
        check_result 0 "APP_KEY 設定確認"
    else
        check_result 1 "APP_KEY 設定確認"
    fi
    
    # データベース設定
    if grep -q "DB_CONNECTION=pgsql" .env && grep -q "DB_HOST=postgres" .env; then
        check_result 0 "データベース 設定確認"
    else
        check_result 1 "データベース 設定確認"
    fi
else
    check_result 1 ".env ファイル確認"
fi

# Laravelの動作確認（可能な場合）
if docker-compose exec -T app php artisan --version > /dev/null 2>&1; then
    check_result 0 "Laravel Artisan 動作確認"
else
    check_result 1 "Laravel Artisan 動作確認"
fi

echo ""

echo "7. 🔍 ログ・デバッグ情報"
echo "----------------------------------------"

show_info "最新のコンテナログ（最後の10行）"
echo ""

echo "📝 App コンテナログ:"
if docker-compose logs --tail=5 app 2>/dev/null; then
    echo ""
else
    echo "ログを取得できません"
fi

echo "🗄️ PostgreSQL コンテナログ:"
if docker-compose logs --tail=5 postgres 2>/dev/null; then
    echo ""
else
    echo "ログを取得できません"
fi

echo ""

# サマリー表示
echo "📋 確認結果サマリー"
echo "========================================"

if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 すべてのチェックが正常に完了しました！${NC}"
    echo ""
    echo "🌐 アクセス情報:"
    echo "メインアプリケーション: http://localhost"
    echo "Meilisearch管理画面:   http://localhost:7700"
    echo "Mailpit (メール確認):   http://localhost:8025"
    echo ""
    echo "👤 ログイン情報:"
    echo "管理者: admin / password"
    echo "ユーザー1: user1 / password"
    echo "ユーザー2: user2 / password"
else
    echo -e "${RED}⚠️  $ERROR_COUNT 個のエラーが見つかりました${NC}"
    echo ""
    echo "修復コマンド:"
    echo "----------------------------------------"
    echo ""
    echo "1. 環境の再構築:"
    echo "   docker-compose down"
    echo "   docker-compose up -d --build"
    echo ""
    echo "2. 完全リセット（データ削除注意）:"
    echo "   docker-compose down -v"
    echo "   docker system prune -f"
    echo "   ./scripts/setup.sh"
    echo ""
    echo "3. 依存関係の再インストール:"
    echo "   docker-compose --profile setup run --rm composer install"
    echo "   docker-compose --profile setup run --rm npm ci && npm run build"
    echo ""
    echo "4. Laravel設定の再実行:"
    echo "   docker-compose exec app php artisan key:generate"
    echo "   docker-compose exec app php artisan migrate"
    echo "   docker-compose exec app php artisan db:seed"
    echo ""
fi

echo ""
echo "🔧 有用なコマンド:"
echo "----------------------------------------"
echo "コンテナ状態確認:     docker-compose ps"
echo "ログリアルタイム表示: docker-compose logs -f app"
echo "アプリコンテナ内実行: docker-compose exec app [command]"
echo "データベースアクセス: docker-compose exec postgres psql -U sail -d knowledge_laravel"
echo ""