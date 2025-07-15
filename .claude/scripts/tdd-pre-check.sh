#!/bin/bash
#
# TDD PreToolUse hooks - 実装前強制チェック
# 
# @description Edit/Write前にテストファイル存在確認、新コンポーネント作成時の自動テンプレート生成
# @param $1 - TOOL_INPUT（ファイルパスまたはツール入力）
# @see CLAUDE.md - TDD必須ルール
#
set -euo pipefail

TOOL_INPUT="${1:-}"
if [[ -z "$TOOL_INPUT" ]]; then
    echo "ℹ️  TDD PreCheck: 入力なし、スキップ"
    exit 0
fi

# TDD厳格モード確認（デフォルト有効）
TDD_STRICT_MODE="${TDD_STRICT_MODE:-true}"
if [[ "$TDD_STRICT_MODE" != "true" ]]; then
    echo "ℹ️  TDD厳格モード無効: PreCheck スキップ"
    exit 0
fi

echo "🧪 TDD PreCheck: 実装前チェック開始"

# TOOL_INPUTからファイルパスを抽出
# JSON形式の場合はfile_pathフィールドを抽出
FILE_PATH=""
if echo "$TOOL_INPUT" | grep -q '"file_path"'; then
    FILE_PATH=$(echo "$TOOL_INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
elif echo "$TOOL_INPUT" | grep -q '/.*\.(tsx\|jsx\|ts\|js)'; then
    # パス形式の場合
    FILE_PATH=$(echo "$TOOL_INPUT" | grep -o '/[^[:space:]]*\.\(tsx\|jsx\|ts\|js\)')
fi

if [[ -z "$FILE_PATH" ]]; then
    echo "ℹ️  TDD PreCheck: 対象ファイルパスが見つかりません"
    exit 0
fi

echo "📁 対象ファイル: $FILE_PATH"

# nextjsディレクトリ配下のファイルのみ処理
if [[ ! "$FILE_PATH" =~ nextjs/ ]]; then
    echo "ℹ️  TDD PreCheck: nextjs配下以外、スキップ"
    exit 0
fi

# Reactコンポーネントファイルの判定
if [[ "$FILE_PATH" =~ \.(tsx|jsx)$ && ("$FILE_PATH" =~ components/ || "$FILE_PATH" =~ app/) && ! "$FILE_PATH" =~ \.(test|spec)\. ]]; then
    echo "🎯 Reactコンポーネント検出: $FILE_PATH"
    
    # テストファイルパスの生成
    DIR_NAME=$(dirname "$FILE_PATH")
    BASE_NAME=$(basename "$FILE_PATH" .tsx)
    BASE_NAME=$(basename "$BASE_NAME" .jsx)
    
    # 優先テストファイルパス
    TEST_DIR="${DIR_NAME}/__tests__"
    TEST_FILE="${TEST_DIR}/${BASE_NAME}.test.tsx"
    
    # テストファイル存在確認
    if [[ ! -f "$TEST_FILE" ]]; then
        echo ""
        echo "🚫 TDD違反: テストファイルが存在しません"
        echo "📁 コンポーネント: $FILE_PATH"
        echo "📝 必要なテスト: $TEST_FILE"
        echo ""
        
        # 自動テストファイル生成オプション
        if [[ "${TDD_AUTO_CREATE_TEST:-true}" = "true" ]]; then
            echo "🤖 自動テストファイル生成中..."
            
            # テストディレクトリ作成
            mkdir -p "$TEST_DIR"
            
            # テンプレートからテストファイル生成
            if [[ -f ".claude/templates/component.test.template.tsx" ]]; then
                cp ".claude/templates/component.test.template.tsx" "$TEST_FILE"
                
                # テンプレート変数置換
                sed -i "s/{{COMPONENT_NAME}}/${BASE_NAME}/g" "$TEST_FILE"
                
                echo "✅ テストファイル自動生成完了: $TEST_FILE"
                echo "📝 次のステップ: Red→Green→Refactorサイクルを実行してください"
                echo ""
                echo "🔴 1. Red: 失敗するテストに修正"
                echo "🟢 2. Green: テストを通す最小実装"
                echo "🔵 3. Refactor: 実装を改善"
                
                exit 0
            else
                echo "❌ テンプレートファイルが見つかりません: .claude/templates/component.test.template.tsx"
            fi
        fi
        
        echo "🔥 TDD必須ルール: 実装前に必ずテストを書いてください"
        echo ""
        echo "💡 手動でテストファイルを作成:"
        echo "   mkdir -p $TEST_DIR"
        echo "   cp .claude/templates/component.test.template.tsx $TEST_FILE"
        echo "   # テンプレート内の {{COMPONENT_NAME}} を ${BASE_NAME} に置換"
        echo ""
        
        # 緊急回避オプション
        if [[ "${TDD_BYPASS:-}" = "1" ]]; then
            echo "⚠️  TDD_BYPASS=1 設定により一時的にスキップします"
            echo "🚨 プロダクション環境では絶対に使用しないでください！"
            exit 0
        fi
        
        exit 1
    fi
    
    echo "✅ テストファイル確認完了: $TEST_FILE"
    
    # Red状態確認（テストが失敗することを確認）
    if [[ "${TDD_CHECK_RED:-true}" = "true" ]]; then
        echo "🔴 Red状態確認: テストが適切に失敗するかチェック中..."
        cd "$(dirname "$FILE_PATH" | sed 's|/[^/]*$||')" # nextjsディレクトリに移動
        
        if npm test -- --testPathPattern="$TEST_FILE" --passWithNoTests --silent &>/dev/null; then
            echo "⚠️  注意: テストが通っています。Red→Green→Refactorサイクルを確認してください"
        else
            echo "✅ Red状態確認: テストが期待通り失敗しています"
        fi
    fi
fi

# API/ユーティリティファイルの場合
if [[ "$FILE_PATH" =~ \.(ts|js)$ && ("$FILE_PATH" =~ lib/ || "$FILE_PATH" =~ utils/ || "$FILE_PATH" =~ api/) && ! "$FILE_PATH" =~ \.(test|spec)\. ]]; then
    echo "🎯 ユーティリティファイル検出: $FILE_PATH"
    
    DIR_NAME=$(dirname "$FILE_PATH")
    BASE_NAME=$(basename "$FILE_PATH" .ts)
    BASE_NAME=$(basename "$BASE_NAME" .js)
    
    TEST_DIR="${DIR_NAME}/__tests__"
    TEST_FILE="${TEST_DIR}/${BASE_NAME}.test.ts"
    
    if [[ ! -f "$TEST_FILE" ]]; then
        echo "⚠️  ユーティリティファイルのテストが推奨されます"
        echo "📝 推奨テストファイル: $TEST_FILE"
        
        if [[ "${TDD_STRICT_UTILS:-false}" = "true" ]]; then
            echo "🚫 TDD厳格モード: ユーティリティファイルもテスト必須です"
            exit 1
        fi
    fi
fi

echo "🎯 TDD PreCheck: 完了"