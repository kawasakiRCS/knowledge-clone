#!/bin/bash

# Knowledge管理システム セットアップ確認スクリプト

echo "🚀 Knowledge管理システム セットアップ確認を開始します..."
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

docker-compose --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    docker compose version > /dev/null 2>&1
    check_result $? "Docker Compose インストール確認"
else
    check_result 0 "Docker Compose インストール確認"
fi

echo ""

echo "2. 📁 プロジェクトファイル確認"
echo "----------------------------------------"

# 重要なファイルの存在確認
files=(
    ".env"
    "docker-compose.yml"
    "composer.json"
    "package.json"
    "app/Models/Knowledge/Knowledge.php"
    "resources/js/app.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        check_result 0 "ファイル存在確認: $file"
    else
        check_result 1 "ファイル存在確認: $file"
    fi
done

echo ""

echo "3. 🐘 データベース接続確認"
echo "----------------------------------------"

# Sailコマンドの存在確認
if [ -f "./vendor/bin/sail" ]; then
    check_result 0 "Laravel Sail 存在確認"
    
    # コンテナの状態確認
    if ./vendor/bin/sail ps | grep -q "Up"; then
        check_result 0 "Docker コンテナ起動確認"
        
        # データベース接続テスト
        ./vendor/bin/sail exec pgsql pg_isready -U sail -d knowledge_laravel > /dev/null 2>&1
        check_result $? "PostgreSQL 接続確認"
        
        # Meilisearch接続テスト
        ./vendor/bin/sail exec meilisearch curl -f http://localhost:7700/health > /dev/null 2>&1
        check_result $? "Meilisearch 接続確認"
        
        # Redis接続テスト
        ./vendor/bin/sail exec redis redis-cli ping > /dev/null 2>&1
        check_result $? "Redis 接続確認"
        
    else
        show_warning "Docker コンテナが起動していません"
        echo "  コンテナを起動してください: ./vendor/bin/sail up -d"
    fi
else
    check_result 1 "Laravel Sail 存在確認"
    echo "  Composer依存関係をインストールしてください: composer install"
fi

echo ""

echo "4. 🌐 Webアプリケーション確認"
echo "----------------------------------------"

# ポート確認
if lsof -i :80 > /dev/null 2>&1; then
    check_result 0 "ポート 80 使用確認"
    
    # HTTP接続テスト
    if curl -f http://localhost > /dev/null 2>&1; then
        check_result 0 "HTTP アクセス確認"
    else
        check_result 1 "HTTP アクセス確認"
    fi
else
    check_result 1 "ポート 80 使用確認"
fi

echo ""

echo "5. 📦 依存関係確認"
echo "----------------------------------------"

# Composer依存関係
if [ -d "vendor" ]; then
    check_result 0 "Composer 依存関係インストール確認"
else
    check_result 1 "Composer 依存関係インストール確認"
fi

# NPM依存関係
if [ -d "node_modules" ]; then
    check_result 0 "NPM 依存関係インストール確認"
else
    check_result 1 "NPM 依存関係インストール確認"
fi

# ビルドファイル
if [ -d "public/build" ]; then
    check_result 0 "フロントエンド ビルドファイル確認"
else
    check_result 1 "フロントエンド ビルドファイル確認"
fi

echo ""

echo "6. 🔧 設定ファイル確認"
echo "----------------------------------------"

# .env ファイルの重要設定確認
if [ -f ".env" ]; then
    # APP_KEY
    if grep -q "APP_KEY=base64:" .env; then
        check_result 0 "APP_KEY 設定確認"
    else
        check_result 1 "APP_KEY 設定確認"
        echo "  アプリケーションキーを生成してください: ./vendor/bin/sail artisan key:generate"
    fi
    
    # データベース設定
    if grep -q "DB_CONNECTION=pgsql" .env && grep -q "DB_DATABASE=knowledge_laravel" .env; then
        check_result 0 "データベース 設定確認"
    else
        check_result 1 "データベース 設定確認"
    fi
    
    # Meilisearch設定
    if grep -q "SCOUT_DRIVER=meilisearch" .env; then
        check_result 0 "Meilisearch 設定確認"
    else
        check_result 1 "Meilisearch 設定確認"
    fi
else
    check_result 1 ".env ファイル確認"
fi

echo ""

# サマリー表示
echo "📋 確認結果サマリー"
echo "========================================"

if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 すべてのチェックが正常に完了しました！${NC}"
    echo ""
    echo "次のステップ:"
    echo "1. ブラウザで http://localhost にアクセス"
    echo "2. 管理者アカウントでログイン (admin / password)"
    echo "3. サンプルデータを確認してみてください"
    echo ""
    echo "Meilisearch管理画面: http://localhost:7700"
else
    echo -e "${RED}⚠️  $ERROR_COUNT 個のエラーが見つかりました${NC}"
    echo ""
    echo "以下の手順でセットアップを完了してください:"
    echo ""
    echo "1. 環境設定:"
    echo "   cp .env.example .env"
    echo ""
    echo "2. Docker環境起動:"
    echo "   ./vendor/bin/sail up -d"
    echo ""
    echo "3. 依存関係インストール:"
    echo "   ./vendor/bin/sail composer install"
    echo "   ./vendor/bin/sail npm install"
    echo ""
    echo "4. アプリケーション設定:"
    echo "   ./vendor/bin/sail artisan key:generate"
    echo "   ./vendor/bin/sail artisan migrate"
    echo "   ./vendor/bin/sail artisan db:seed"
    echo ""
    echo "5. フロントエンドビルド:"
    echo "   ./vendor/bin/sail npm run build"
    echo ""
    echo "6. 検索インデックス作成:"
    echo "   ./vendor/bin/sail artisan scout:import \"App\Models\Knowledge\Knowledge\""
fi

echo ""
echo "詳細な手順については README.md を参照してください。"
echo ""