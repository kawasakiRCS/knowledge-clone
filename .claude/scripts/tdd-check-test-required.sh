#!/bin/bash
#
# TDD必須チェックスクリプト
# 
# @description ファイル作成・編集時にテストファイルの存在を確認
# @usage ./tdd-check-test-required.sh <file_path>
# @see CLAUDE.md - TDD必須ルール
#
set -euo pipefail

FILE_PATH="${1:-}"
if [[ -z "$FILE_PATH" ]]; then
    echo "❌ エラー: ファイルパスが指定されていません"
    exit 1
fi

# TDD厳格モード確認
TDD_STRICT_MODE="${TDD_STRICT_MODE:-true}"
if [[ "$TDD_STRICT_MODE" != "true" ]]; then
    echo "ℹ️  TDD厳格モード無効: チェックをスキップ"
    exit 0
fi

# Reactコンポーネントファイルの判定
if [[ "$FILE_PATH" =~ \.(tsx|jsx)$ && "$FILE_PATH" =~ (components|app)/ && ! "$FILE_PATH" =~ \.(test|spec)\. ]]; then
    echo "🧪 TDD検証: Reactコンポーネントのテストファイル確認中..."
    
    # テストファイルパスの候補を生成
    DIR_NAME=$(dirname "$FILE_PATH")
    BASE_NAME=$(basename "$FILE_PATH" .tsx)
    BASE_NAME=$(basename "$BASE_NAME" .jsx)
    
    # テストファイルパターン
    TEST_PATTERNS=(
        "${DIR_NAME}/__tests__/${BASE_NAME}.test.tsx"
        "${DIR_NAME}/__tests__/${BASE_NAME}.test.jsx"
        "${DIR_NAME}/${BASE_NAME}.test.tsx"
        "${DIR_NAME}/${BASE_NAME}.test.jsx"
        "${DIR_NAME}/${BASE_NAME}.spec.tsx"
        "${DIR_NAME}/${BASE_NAME}.spec.jsx"
    )
    
    TEST_EXISTS=false
    for PATTERN in "${TEST_PATTERNS[@]}"; do
        if [[ -f "$PATTERN" ]]; then
            TEST_EXISTS=true
            echo "✅ テストファイル発見: $PATTERN"
            break
        fi
    done
    
    if [[ "$TEST_EXISTS" = false ]]; then
        echo ""
        echo "🚫 TDD違反: テストファイルが存在しません"
        echo "📁 対象ファイル: $FILE_PATH"
        echo "📝 必要なテストファイル（いずれか）:"
        for PATTERN in "${TEST_PATTERNS[@]}"; do
            echo "   - $PATTERN"
        done
        echo ""
        echo "🔥 TDD必須ルール: 実装前に必ずテストを書いてください"
        echo "📚 テンプレート: .claude/templates/component.test.template.tsx"
        echo ""
        echo "💡 テストファイル作成方法:"
        echo "   mkdir -p ${DIR_NAME}/__tests__"
        echo "   cp .claude/templates/component.test.template.tsx ${DIR_NAME}/__tests__/${BASE_NAME}.test.tsx"
        echo "   # テンプレート内の {{COMPONENT_NAME}} を ${BASE_NAME} に置換"
        echo ""
        
        # 緊急回避オプション
        if [[ "${TDD_BYPASS:-}" = "1" ]]; then
            echo "⚠️  TDD_BYPASS=1 が設定されています。一時的にスキップします。"
            echo "🚨 プロダクション環境では絶対に使用しないでください！"
            exit 0
        fi
        
        exit 1
    fi
    
    echo "✅ TDD検証完了: テストファイルが存在します"
fi

# 一般的なTypeScript/JavaScriptファイル（utilsなど）
if [[ "$FILE_PATH" =~ \.(ts|js)$ && "$FILE_PATH" =~ (lib|utils|helpers)/ && ! "$FILE_PATH" =~ \.(test|spec)\. ]]; then
    echo "🧪 TDD検証: ユーティリティファイルのテストファイル確認中..."
    
    DIR_NAME=$(dirname "$FILE_PATH")
    BASE_NAME=$(basename "$FILE_PATH" .ts)
    BASE_NAME=$(basename "$BASE_NAME" .js)
    
    TEST_PATTERNS=(
        "${DIR_NAME}/__tests__/${BASE_NAME}.test.ts"
        "${DIR_NAME}/__tests__/${BASE_NAME}.test.js"
        "${DIR_NAME}/${BASE_NAME}.test.ts"
        "${DIR_NAME}/${BASE_NAME}.test.js"
    )
    
    TEST_EXISTS=false
    for PATTERN in "${TEST_PATTERNS[@]}"; do
        if [[ -f "$PATTERN" ]]; then
            TEST_EXISTS=true
            echo "✅ テストファイル発見: $PATTERN"
            break
        fi
    done
    
    if [[ "$TEST_EXISTS" = false ]]; then
        echo "⚠️  ユーティリティファイルのテストが存在しません: $FILE_PATH"
        echo "📝 推奨テストファイル: ${DIR_NAME}/__tests__/${BASE_NAME}.test.ts"
        
        if [[ "${TDD_BYPASS:-}" != "1" ]]; then
            echo "🔄 TDD推奨: テストファイルの作成を検討してください"
        fi
    fi
fi

echo "🎯 TDD検証: 完了"