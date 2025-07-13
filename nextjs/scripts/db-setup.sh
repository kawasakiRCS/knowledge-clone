#!/bin/bash

# Knowledge Database Setup Script
# データベース環境の構築とリストアを実行

set -e

echo "🐘 Knowledge Database Setup"
echo "=========================="

# 1. Docker Composeでデータベース起動
echo "📦 Starting PostgreSQL container..."
docker-compose up -d postgres

# 2. データベースの準備完了を待機
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while ! docker-compose exec -T postgres pg_isready -U knowledge_user -d knowledge > /dev/null 2>&1; do
  if [ $counter -eq $timeout ]; then
    echo "❌ Error: PostgreSQL startup timeout"
    exit 1
  fi
  echo "  Waiting... ($counter/$timeout)"
  sleep 2
  counter=$((counter + 2))
done

echo "✅ PostgreSQL is ready!"

# 3. Prismaクライアント生成
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# 4. データベース接続テスト
echo "🔌 Testing database connection..."
if docker-compose exec -T postgres psql -U knowledge_user -d knowledge -c "SELECT version();" > /dev/null 2>&1; then
  echo "✅ Database connection successful!"
else
  echo "❌ Database connection failed!"
  exit 1
fi

# 5. テーブル数確認
TABLE_COUNT=$(docker-compose exec -T postgres psql -U knowledge_user -d knowledge -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo "📊 Tables in database: $TABLE_COUNT"

# 6. pgAdmin起動
echo "🌐 Starting pgAdmin..."
docker-compose up -d pgadmin

echo ""
echo "🎉 Database setup completed!"
echo ""
echo "📋 Connection Info:"
echo "  Database URL: postgresql://knowledge_user:knowledge_pass@localhost:5433/knowledge"
echo "  pgAdmin URL:  http://localhost:8080"
echo "  pgAdmin User: admin@knowledge.local"
echo "  pgAdmin Pass: admin"
echo ""
echo "🔧 Useful Commands:"
echo "  Connect to DB: docker-compose exec postgres psql -U knowledge_user -d knowledge"
echo "  Stop services: docker-compose down"
echo "  View logs:     docker-compose logs postgres"
echo "  Reset data:    docker-compose down -v && ./scripts/db-setup.sh"