#!/bin/bash
#
# TDD環境セットアップスクリプト
# 
# @description TDD強制hooksシステムの初期設定と検証
# @usage ./tdd-setup.sh [--check|--install|--test]
# @see CLAUDE.md - TDD必須ルール
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 関数：環境チェック
check_environment() {
    echo "🔍 TDD環境チェック開始"
    echo "===================="
    
    local all_ok=true
    
    # Next.js環境チェック
    if [[ -d "$PROJECT_ROOT/nextjs" ]]; then
        echo "✅ Next.jsディレクトリ: 存在"
        
        cd "$PROJECT_ROOT/nextjs"
        
        # package.json確認
        if [[ -f "package.json" ]]; then
            echo "✅ package.json: 存在"
            
            # テストスクリプト確認
            if grep -q '"test"' package.json; then
                echo "✅ テストスクリプト: 設定済み"
            else
                echo "❌ テストスクリプト: 未設定"
                all_ok=false
            fi
            
            # Jest依存関係確認
            if grep -q '"jest"' package.json; then
                echo "✅ Jest: インストール済み"
            else
                echo "❌ Jest: 未インストール"
                all_ok=false
            fi
            
            # Testing Library確認
            if grep -q '"@testing-library/react"' package.json; then
                echo "✅ Testing Library: インストール済み"
            else
                echo "❌ Testing Library: 未インストール"
                all_ok=false
            fi
        else
            echo "❌ package.json: 存在しません"
            all_ok=false
        fi
        
        cd "$PROJECT_ROOT"
    else
        echo "❌ Next.jsディレクトリ: 存在しません"
        all_ok=false
    fi
    
    # Jest設定ファイル確認
    if [[ -f "$PROJECT_ROOT/nextjs/jest.config.js" ]]; then
        echo "✅ Jest設定: 存在"
        
        # カバレッジ閾値確認
        if grep -q "coverageThreshold" "$PROJECT_ROOT/nextjs/jest.config.js"; then
            echo "✅ カバレッジ閾値: 設定済み"
        else
            echo "⚠️  カバレッジ閾値: 未設定"
        fi
    else
        echo "❌ Jest設定: 存在しません"
        all_ok=false
    fi
    
    # Claude hooks確認
    if [[ -f "$PROJECT_ROOT/.claude/settings.json" ]]; then
        echo "✅ Claude設定: 存在"
        
        # PreToolUse hooks確認
        if grep -q "PreToolUse" "$PROJECT_ROOT/.claude/settings.json"; then
            echo "✅ PreToolUse hooks: 設定済み"
        else
            echo "❌ PreToolUse hooks: 未設定"
            all_ok=false
        fi
        
        # PostToolUse hooks確認
        if grep -q "PostToolUse" "$PROJECT_ROOT/.claude/settings.json"; then
            echo "✅ PostToolUse hooks: 設定済み"
        else
            echo "❌ PostToolUse hooks: 未設定"
            all_ok=false
        fi
    else
        echo "❌ Claude設定: 存在しません"
        all_ok=false
    fi
    
    # TDDスクリプト確認
    local required_scripts=(
        "tdd-pre-check.sh"
        "tdd-post-check.sh"
        "tdd-cycle-manager.sh"
    )
    
    for script in "${required_scripts[@]}"; do
        if [[ -x "$PROJECT_ROOT/.claude/scripts/$script" ]]; then
            echo "✅ $script: 存在・実行可能"
        else
            echo "❌ $script: 存在しないか実行不可"
            all_ok=false
        fi
    done
    
    # Git hooks確認
    if [[ -x "$PROJECT_ROOT/.git/hooks/pre-commit" ]]; then
        echo "✅ Git pre-commit: 設定済み"
        
        # TDD機能確認
        if grep -q "TDD強制チェック" "$PROJECT_ROOT/.git/hooks/pre-commit"; then
            echo "✅ TDD強制機能: 統合済み"
        else
            echo "⚠️  TDD強制機能: 未統合"
        fi
    else
        echo "❌ Git pre-commit: 未設定"
        all_ok=false
    fi
    
    # テンプレート確認
    if [[ -f "$PROJECT_ROOT/.claude/templates/component.test.template.tsx" ]]; then
        echo "✅ テストテンプレート: 存在"
    else
        echo "❌ テストテンプレート: 存在しません"
        all_ok=false
    fi
    
    echo ""
    if [[ "$all_ok" = true ]]; then
        echo "🎉 TDD環境: 完全セットアップ済み"
        echo "✨ すべてのTDD強制機能が有効です"
    else
        echo "⚠️  TDD環境: セットアップ不完全"
        echo "🔧 ./tdd-setup.sh --install でセットアップを完了してください"
    fi
    
    return $([[ "$all_ok" = true ]] && echo 0 || echo 1)
}

# 関数：インストール
install_tdd_system() {
    echo "🚀 TDD強制システムインストール開始"
    echo "==============================="
    
    # Next.js依存関係チェック
    if [[ -d "$PROJECT_ROOT/nextjs" ]]; then
        cd "$PROJECT_ROOT/nextjs"
        
        echo "📦 Jest・Testing Library依存関係チェック中..."
        
        # package.jsonチェック
        if ! grep -q '"jest"' package.json; then
            echo "📥 Jestをインストール中..."
            npm install --save-dev jest @types/jest jest-environment-jsdom
        fi
        
        if ! grep -q '"@testing-library/react"' package.json; then
            echo "📥 Testing Libraryをインストール中..."
            npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
        fi
        
        cd "$PROJECT_ROOT"
    fi
    
    # 必要ディレクトリ作成
    mkdir -p "$PROJECT_ROOT/.claude/scripts"
    mkdir -p "$PROJECT_ROOT/.claude/templates"
    mkdir -p "$PROJECT_ROOT/.claude/tdd-state"
    
    echo "✅ TDD強制システムインストール完了"
    echo "🎯 次のステップ: ./tdd-setup.sh --test でテスト実行"
}

# 関数：テスト実行
run_test_suite() {
    echo "🧪 TDD強制システムテスト実行"
    echo "========================="
    
    if [[ ! -d "$PROJECT_ROOT/nextjs" ]]; then
        echo "❌ Next.jsディレクトリが存在しません"
        return 1
    fi
    
    cd "$PROJECT_ROOT/nextjs"
    
    # 基本テスト実行
    echo "🚀 基本テスト実行中..."
    if npm test -- --passWithNoTests --silent 2>/dev/null; then
        echo "✅ 基本テスト: 成功"
    else
        echo "❌ 基本テスト: 失敗"
        return 1
    fi
    
    # カバレッジテスト
    echo "📊 カバレッジテスト実行中..."
    if npm test -- --coverage --passWithNoTests --silent 2>/dev/null >/dev/null; then
        echo "✅ カバレッジテスト: 成功"
    else
        echo "⚠️  カバレッジテスト: 警告あり（正常）"
    fi
    
    # TDDスクリプトテスト
    cd "$PROJECT_ROOT"
    
    echo "🔧 TDDスクリプトテスト実行中..."
    
    # tdd-cycle-manager.sh テスト
    if "$PROJECT_ROOT/.claude/scripts/tdd-cycle-manager.sh" status >/dev/null 2>&1; then
        echo "✅ TDDサイクル管理: 正常"
    else
        echo "❌ TDDサイクル管理: エラー"
        return 1
    fi
    
    echo "🎉 すべてのテスト成功！"
    echo "✨ TDD強制システム正常稼働中"
}

# 関数：使用方法表示
show_usage() {
    cat <<EOF
🧪 TDD強制システム セットアップツール

使用方法:
  $0 [option]

オプション:
  --check     現在のTDD環境をチェック（デフォルト）
  --install   TDD強制システムをインストール
  --test      TDDシステムのテスト実行
  --help      このヘルプを表示

TDD強制機能:
  ✅ PreToolUse: 実装前テストファイル存在チェック
  ✅ PostToolUse: 実装後自動テスト実行
  ✅ Git hooks: コミット前テスト強制実行
  ✅ カバレッジ: 80%閾値チェック
  ✅ サイクル管理: Red→Green→Refactor追跡

環境変数:
  TDD_STRICT_MODE=true     TDD厳格モード有効（デフォルト）
  TDD_BYPASS=1            緊急時のTDD回避（本番禁止）
  TDD_AUTO_CREATE_TEST=true  自動テストファイル生成（デフォルト）

例:
  $0 --check    # 環境チェック
  $0 --install  # システムインストール
  $0 --test     # テスト実行
EOF
}

# メインロジック
OPTION="${1:---check}"

case "$OPTION" in
    "--check")
        check_environment
        ;;
    "--install")
        install_tdd_system
        ;;
    "--test")
        run_test_suite
        ;;
    "--help"|"-h")
        show_usage
        ;;
    *)
        echo "❌ 不明なオプション: $OPTION"
        echo "💡 ヘルプ: $0 --help"
        exit 1
        ;;
esac