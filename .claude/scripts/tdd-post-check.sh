#!/bin/bash
#
# TDD PostToolUse hooks - 実装後自動検証
# 
# @description Edit/Write後に自動テスト実行、TDDサイクル状況表示、カバレッジチェック
# @param $1 - TOOL_INPUT（ファイルパスまたはツール入力）
# @see CLAUDE.md - TDD必須ルール
#
set -euo pipefail

TOOL_INPUT="${1:-}"
if [[ -z "$TOOL_INPUT" ]]; then
    echo "ℹ️  TDD PostCheck: 入力なし、スキップ"
    exit 0
fi

# TDD厳格モード確認
TDD_STRICT_MODE="${TDD_STRICT_MODE:-true}"
if [[ "$TDD_STRICT_MODE" != "true" ]]; then
    echo "ℹ️  TDD厳格モード無効: PostCheck スキップ"
    exit 0
fi

echo "🧪 TDD PostCheck: 実装後自動検証開始"

# TOOL_INPUTからファイルパスを抽出
FILE_PATH=""
if echo "$TOOL_INPUT" | grep -q '"file_path"'; then
    FILE_PATH=$(echo "$TOOL_INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
elif echo "$TOOL_INPUT" | grep -q '/.*\.(tsx\|jsx\|ts\|js)'; then
    FILE_PATH=$(echo "$TOOL_INPUT" | grep -o '/[^[:space:]]*\.\(tsx\|jsx\|ts\|js\)')
fi

if [[ -z "$FILE_PATH" ]]; then
    echo "ℹ️  TDD PostCheck: 対象ファイルパスが見つかりません"
    exit 0
fi

echo "📁 編集されたファイル: $FILE_PATH"

# nextjsディレクトリ配下のファイルのみ処理
if [[ ! "$FILE_PATH" =~ nextjs/ ]]; then
    echo "ℹ️  TDD PostCheck: nextjs配下以外、スキップ"
    exit 0
fi

# テスト対象ファイルかチェック（テストファイル自体は除外）
if [[ "$FILE_PATH" =~ \.(test|spec)\. ]]; then
    echo "🧪 テストファイル編集検出: $FILE_PATH"
    TEST_RUN_MODE="test-file"
else
    echo "📝 実装ファイル編集検出: $FILE_PATH"
    TEST_RUN_MODE="implementation-file"
fi

# nextjsディレクトリに移動
NEXTJS_DIR=""
if [[ "$FILE_PATH" =~ (.*nextjs)/ ]]; then
    NEXTJS_DIR=$(echo "$FILE_PATH" | sed 's|\(.*nextjs\)/.*|\1|')
elif [[ -d "$(pwd)/nextjs" ]]; then
    NEXTJS_DIR="$(pwd)/nextjs"
else
    echo "❌ nextjsディレクトリが見つかりません"
    exit 1
fi

cd "$NEXTJS_DIR"
echo "📂 作業ディレクトリ: $NEXTJS_DIR"

# 関連テストファイルの特定
RELATED_TEST_FILES=()
if [[ "$TEST_RUN_MODE" = "implementation-file" ]]; then
    # 実装ファイルから関連テストファイルを特定
    REL_PATH="${FILE_PATH#$NEXTJS_DIR/}"
    DIR_NAME=$(dirname "$REL_PATH")
    BASE_NAME=$(basename "$REL_PATH" .tsx)
    BASE_NAME=$(basename "$BASE_NAME" .jsx)
    BASE_NAME=$(basename "$BASE_NAME" .ts)
    BASE_NAME=$(basename "$BASE_NAME" .js)
    
    # テストファイル候補
    TEST_CANDIDATES=(
        "${DIR_NAME}/__tests__/${BASE_NAME}.test.tsx"
        "${DIR_NAME}/__tests__/${BASE_NAME}.test.jsx"
        "${DIR_NAME}/__tests__/${BASE_NAME}.test.ts"
        "${DIR_NAME}/__tests__/${BASE_NAME}.test.js"
        "${DIR_NAME}/${BASE_NAME}.test.tsx"
        "${DIR_NAME}/${BASE_NAME}.test.jsx"
        "${DIR_NAME}/${BASE_NAME}.test.ts"
        "${DIR_NAME}/${BASE_NAME}.test.js"
    )
    
    for candidate in "${TEST_CANDIDATES[@]}"; do
        if [[ -f "$candidate" ]]; then
            RELATED_TEST_FILES+=("$candidate")
            echo "🎯 関連テスト発見: $candidate"
        fi
    done
    
    if [[ ${#RELATED_TEST_FILES[@]} -eq 0 ]]; then
        echo "⚠️  関連テストファイルが見つかりません"
        echo "🔍 確認した候補:"
        for candidate in "${TEST_CANDIDATES[@]}"; do
            echo "   - $candidate"
        done
    fi
else
    # テストファイル自体が編集された場合
    REL_PATH="${FILE_PATH#$NEXTJS_DIR/}"
    RELATED_TEST_FILES+=("$REL_PATH")
fi

# 自動テスト実行
if [[ ${#RELATED_TEST_FILES[@]} -gt 0 ]]; then
    echo ""
    echo "🚀 関連テスト自動実行中..."
    
    TEST_SUCCESS=true
    for test_file in "${RELATED_TEST_FILES[@]}"; do
        echo "🧪 テスト実行: $test_file"
        
        # 個別テストファイル実行
        if npm test -- --testPathPattern="$test_file" --passWithNoTests --verbose=false 2>/dev/null; then
            echo "✅ テスト成功: $test_file"
        else
            echo "❌ テスト失敗: $test_file"
            TEST_SUCCESS=false
            
            # 詳細なエラー情報表示（厳格モードの場合）
            if [[ "${TDD_VERBOSE_ERRORS:-true}" = "true" ]]; then
                echo "🔍 詳細エラー情報:"
                npm test -- --testPathPattern="$test_file" --passWithNoTests --verbose 2>&1 | tail -20
            fi
        fi
    done
    
    echo ""
    if [[ "$TEST_SUCCESS" = true ]]; then
        echo "🎉 すべてのテスト成功！"
        
        # TDDサイクル状況確認
        TDD_PHASE_FILE=".claude/tdd-phase"
        if [[ -f "$TDD_PHASE_FILE" ]]; then
            CURRENT_PHASE=$(cat "$TDD_PHASE_FILE")
            echo "📊 現在のTDDフェーズ: $CURRENT_PHASE"
            
            case "$CURRENT_PHASE" in
                "🔴 RED")
                    echo "🟢 次のステップ: Green フェーズ（テストを通す実装）"
                    echo "🟢 GREEN" > "$TDD_PHASE_FILE"
                    ;;
                "🟢 GREEN")
                    echo "🔵 次のステップ: Refactor フェーズ（実装改善）"
                    ;;
            esac
        fi
        
        # カバレッジチェック（オプション）
        if [[ "${TDD_CHECK_COVERAGE:-false}" = "true" ]]; then
            echo "📊 カバレッジチェック実行中..."
            npm test -- --coverage --testPathPattern="$(echo "${RELATED_TEST_FILES[@]}" | tr ' ' '|')" --coverageReporters=text-summary --silent 2>/dev/null || true
        fi
        
    else
        echo "💥 テスト失敗: TDDサイクルを確認してください"
        echo ""
        echo "🔄 TDDガイド:"
        echo "🔴 Red: 失敗するテストを修正"
        echo "🟢 Green: テストを通す最小実装"
        echo "🔵 Refactor: 実装を改善"
        echo ""
        
        # 厳格モード：テスト失敗時の処理
        if [[ "${TDD_FAIL_ON_TEST_ERROR:-false}" = "true" ]]; then
            echo "🚫 TDD厳格モード: テスト失敗により処理を中断"
            exit 1
        fi
    fi
    
else
    echo "ℹ️  実行するテストがありません"
fi

# プロジェクト全体の簡易テスト（オプション）
if [[ "${TDD_RUN_ALL_TESTS:-false}" = "true" ]]; then
    echo ""
    echo "🌐 プロジェクト全体テスト実行中..."
    if npm test -- --passWithNoTests --silent 2>/dev/null; then
        echo "✅ 全体テスト成功"
    else
        echo "❌ 全体テスト失敗: 他の変更が影響している可能性があります"
    fi
fi

echo "🎯 TDD PostCheck: 完了"