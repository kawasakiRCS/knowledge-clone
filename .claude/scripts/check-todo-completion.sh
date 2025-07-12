#!/bin/bash
# TodoWrite完了チェックスクリプト
# Issue完了手続きタスクが完了したかを確認し、リマインダーを表示

# TODOファイルのパスを探す（最新のTODOファイル）
TODO_FILE=$(find ~/.claude/todos -name "*$(pwd | sed 's|/home/ubuntu01/workspace/||' | sed 's|/|-|g')*.json" -type f -mtime -1 2>/dev/null | head -n 1)

if [ -f "$TODO_FILE" ]; then
    # Issue完了手続きタスクが完了しているかチェック
    if grep -q '"content".*Issue.*完了.*手続き.*"status".*"completed"' "$TODO_FILE" 2>/dev/null || \
       grep -q '"content".*PROGRESS.*更新.*Issue.*完了.*"status".*"completed"' "$TODO_FILE" 2>/dev/null; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "⚠️  Issue完了手続きタスクが完了しました！"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "📋 以下の手順を確実に実行してください："
        echo ""
        echo "1. [ ] PROGRESS.mdの更新"
        echo "2. [ ] git add -A && git commit"
        echo "3. [ ] gh issue comment <Issue番号>"
        echo "4. [ ] gh issue close <Issue番号>"
        echo ""
        echo "💡 ヒント: コミットメッセージは以下の形式で："
        echo "   feat: Issue #XX - 実装内容の概要"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi
fi