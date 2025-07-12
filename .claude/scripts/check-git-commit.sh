#!/bin/bash
# git commit実行前チェックスクリプト
# コミット前にPROGRESS.mdの更新を確認

# 標準入力からコマンドを読み取る
read -r COMMAND

# git commitコマンドかチェック
if echo "$COMMAND" | grep -q "git commit"; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 コミット前チェックリスト"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # PROGRESS.mdが変更されているかチェック
    if git diff --name-only --cached | grep -q "PROGRESS.md"; then
        echo "✅ PROGRESS.md が更新されています"
    else
        echo "⚠️  PROGRESS.md の更新を確認してください！"
        echo "   未更新の場合: git add ../PROGRESS.md"
    fi
    
    echo ""
    echo "📋 コミットメッセージ形式："
    echo "   feat: Issue #XX - 実装内容の概要"
    echo "   fix: Issue #XX - バグ修正の概要"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

# gh issue操作時のリマインダー
if echo "$COMMAND" | grep -q "gh issue"; then
    echo ""
    echo "💡 GitHub Issue操作を検出しました"
    echo "   操作後は必ずPROGRESS.mdも更新してください！"
    echo ""
fi