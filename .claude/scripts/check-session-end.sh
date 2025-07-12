#!/bin/bash
# セッション終了時チェックスクリプト
# 未完了タスクやコミットされていない変更を警告

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 セッション終了時チェック"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 作業ディレクトリの確認
cd /home/ubuntu01/workspace/knowledge 2>/dev/null || cd /home/ubuntu01/workspace/knowledge/nextjs 2>/dev/null

# 未コミットの変更をチェック
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo "⚠️  警告: コミットされていない変更があります！"
    echo ""
    echo "変更されたファイル:"
    git status --porcelain | head -10
    echo ""
    echo "対処法:"
    echo "  1. 変更を確認: git status"
    echo "  2. コミット: git add -A && git commit -m 'メッセージ'"
    echo ""
else
    echo "✅ すべての変更がコミット済みです"
fi

# セッションログから未完了のIssue操作をチェック
SESSION_LOG=$(find ~/.claude/projects -name "*.jsonl" -mtime -1 2>/dev/null | xargs grep -l "Issue.*実装完了\|完了しました" 2>/dev/null | head -1)

if [ -f "$SESSION_LOG" ]; then
    # Issueが完了したがクローズされていないかチェック
    if grep -q "Issue.*実装完了\|完了しました" "$SESSION_LOG" 2>/dev/null && \
       ! grep -q "gh issue close\|Closed issue" "$SESSION_LOG" 2>/dev/null; then
        echo ""
        echo "⚠️  警告: 完了したIssueがクローズされていない可能性があります！"
        echo ""
        echo "確認事項:"
        echo "  1. GitHub Issueの状態を確認: gh issue list --state open"
        echo "  2. 必要に応じてクローズ: gh issue close <番号>"
    fi
fi

# ローカルとリモートの差分をチェック
LOCAL_AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
if [ "$LOCAL_AHEAD" -gt 0 ]; then
    echo ""
    echo "📤 リモートより $LOCAL_AHEAD コミット進んでいます"
    echo "   プッシュする場合: git push origin main"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 次回セッション開始時は PROGRESS.md を確認してください"
echo ""