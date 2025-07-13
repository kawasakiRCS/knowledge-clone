#!/bin/bash
#
# Claude Code ファイル編集時 Issue ワークフロー強制スクリプト
#
# 目的: ファイル編集時に必ずIssue作業との紐づけを確認・強制
# 実行タイミング: Edit/MultiEdit/Write ツール使用後
#

# 作業ディレクトリに移動
cd /home/ubuntu01/workspace/knowledge 2>/dev/null || cd /home/ubuntu01/workspace/knowledge/nextjs 2>/dev/null

echo ""
echo "🔍 Issue ワークフロー チェック開始..."

# 1. 現在のGitの変更状況を確認
CHANGED_FILES=$(git status --porcelain 2>/dev/null | wc -l)

if [ "$CHANGED_FILES" -eq 0 ]; then
    echo "✅ ファイル変更なし"
    exit 0
fi

echo "📝 変更されたファイル数: $CHANGED_FILES"

# 2. 最新のコミットからIssue番号を確認
LAST_COMMIT_MSG=$(git log --oneline -1 2>/dev/null || echo "")
CURRENT_ISSUE=""

if echo "$LAST_COMMIT_MSG" | grep -qE "#[0-9]+"; then
    CURRENT_ISSUE=$(echo "$LAST_COMMIT_MSG" | grep -oE "#[0-9]+" | head -1 | sed 's/#//')
    echo "🎯 現在作業中のIssue: #$CURRENT_ISSUE"
else
    echo "⚠️  警告: 最新コミットにIssue番号がありません"
fi

# 3. PROGRESS.mdから現在のIssue状況を確認
if [ -f "PROGRESS.md" ]; then
    PROGRESS_ISSUE=$(grep -E "現在の作業.*#[0-9]+" PROGRESS.md 2>/dev/null | grep -oE "#[0-9]+" | head -1 | sed 's/#//' || echo "")
    if [ -n "$PROGRESS_ISSUE" ]; then
        echo "📋 PROGRESS.mdの作業Issue: #$PROGRESS_ISSUE"
        CURRENT_ISSUE="$PROGRESS_ISSUE"
    fi
fi

# 4. GitHub CLIで開いているIssueを確認
if command -v gh &> /dev/null; then
    OPEN_ISSUES=$(gh issue list --state open --limit 5 --json number,title 2>/dev/null)
    if [ -n "$OPEN_ISSUES" ] && [ "$OPEN_ISSUES" != "[]" ]; then
        echo ""
        echo "📂 開いているIssue一覧:"
        echo "$OPEN_ISSUES" | jq -r '.[] | "  #\(.number): \(.title)"' 2>/dev/null || echo "  Issue一覧の取得に失敗"
    fi
fi

# 5. Issue番号が特定できない場合の警告
if [ -z "$CURRENT_ISSUE" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  警告: 作業中のIssue番号が特定できません"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 推奨アクション:"
    echo "  1. 既存Issue確認: gh issue list --state open"
    echo "  2. 新規Issue作成: gh issue create --title \"タイトル\" --body \"詳細\""
    echo "  3. コミット時にIssue番号を含める: git commit -m \"feat: Issue #番号 - 内容\""
    echo ""
    echo "💡 ヒント: 全ての変更は必ずIssueと紐づけることが必要です"
    echo ""
else
    echo "✅ Issue #$CURRENT_ISSUE での作業を継続中"
    
    # GitHub CLIでIssue存在確認
    if command -v gh &> /dev/null; then
        if gh issue view "$CURRENT_ISSUE" &> /dev/null; then
            ISSUE_TITLE=$(gh issue view "$CURRENT_ISSUE" --json title -q '.title' 2>/dev/null)
            echo "📝 Issue詳細: #$CURRENT_ISSUE - $ISSUE_TITLE"
        else
            echo "⚠️  警告: Issue #$CURRENT_ISSUE がGitHub上に見つかりません"
        fi
    fi
fi

echo "✅ Issue ワークフロー チェック完了"
echo ""

exit 0