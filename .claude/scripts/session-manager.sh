#!/bin/bash
#
# Claude Code セッション管理スクリプト
#
# 目的: セッション開始時のIssue状況確認と継続作業の支援
# 実行タイミング: セッション開始時（手動実行）
#

# 作業ディレクトリに移動
cd /home/ubuntu01/workspace/knowledge 2>/dev/null || cd /home/ubuntu01/workspace/knowledge/nextjs 2>/dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Claude Code セッション開始 - Issue管理"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 基本情報の表示
echo "📍 現在の状況:"
echo "  作業ディレクトリ: $(pwd)"
echo "  現在のブランチ: $(git branch --show-current 2>/dev/null || echo 'unknown')"
echo "  最新コミット: $(git log --oneline -1 2>/dev/null || echo 'none')"
echo ""

# 2. 未コミットの変更をチェック
UNCOMMITTED_CHANGES=$(git status --porcelain 2>/dev/null | wc -l)
if [ "$UNCOMMITTED_CHANGES" -gt 0 ]; then
    echo "⚠️  未コミットの変更: $UNCOMMITTED_CHANGES ファイル"
    echo "変更されたファイル:"
    git status --porcelain | head -5 | sed 's/^/  /'
    echo ""
else
    echo "✅ すべての変更がコミット済み"
    echo ""
fi

# 3. PROGRESS.mdから継続作業を確認
if [ -f "PROGRESS.md" ]; then
    echo "📋 PROGRESS.md からの情報:"
    
    # 最新のIssue番号を抽出
    LATEST_ISSUE=$(grep -E "## Issue #[0-9]+" PROGRESS.md | tail -1 | grep -oE "#[0-9]+" | sed 's/#//' || echo "")
    if [ -n "$LATEST_ISSUE" ]; then
        echo "  最新Issue: #$LATEST_ISSUE"
        
        # 該当Issueの詳細を取得
        ISSUE_DETAIL=$(grep -A 10 "## Issue #$LATEST_ISSUE" PROGRESS.md | head -10)
        echo "  詳細:"
        echo "$ISSUE_DETAIL" | sed 's/^/    /'
    else
        echo "  Issue番号が見つかりません"
    fi
    echo ""
else
    echo "⚠️  PROGRESS.md が見つかりません"
    echo "  作業進捗の記録のために PROGRESS.md の作成を推奨します"
    echo ""
fi

# 4. GitHub CLIで開いているIssueを確認
if command -v gh &> /dev/null; then
    echo "🔍 GitHub Issue状況:"
    
    # 開いているIssueを取得
    OPEN_ISSUES=$(gh issue list --state open --limit 10 --json number,title,updatedAt --assignee @me 2>/dev/null)
    
    if [ -n "$OPEN_ISSUES" ] && [ "$OPEN_ISSUES" != "[]" ]; then
        echo "  開いているIssue（自分担当）:"
        echo "$OPEN_ISSUES" | jq -r '.[] | "    #\(.number): \(.title)"' 2>/dev/null || echo "    解析に失敗"
        
        # 最近更新されたIssueを特定
        RECENT_ISSUE=$(echo "$OPEN_ISSUES" | jq -r 'sort_by(.updatedAt) | reverse | .[0] | .number' 2>/dev/null)
        if [ -n "$RECENT_ISSUE" ] && [ "$RECENT_ISSUE" != "null" ]; then
            echo ""
            echo "💡 推奨: 最近更新されたIssue #$RECENT_ISSUE から作業を再開"
        fi
    else
        echo "  開いているIssue（自分担当）: なし"
    fi
    echo ""
else
    echo "⚠️  GitHub CLI (gh) が利用できません"
    echo "  Issue管理のために GitHub CLI のインストールを推奨します"
    echo ""
fi

# 5. 継続作業の提案
echo "🎯 推奨アクション:"

if [ "$UNCOMMITTED_CHANGES" -gt 0 ]; then
    echo "  1. 未コミット変更の処理:"
    echo "     - 確認: git status"
    echo "     - コミット: git add -A && git commit -m \"作業内容\""
    echo "     - 破棄: git checkout -- ."
elif [ -n "$LATEST_ISSUE" ]; then
    echo "  1. Issue #$LATEST_ISSUE の継続作業"
    echo "     - Issue詳細確認: gh issue view $LATEST_ISSUE"
    echo "     - 作業再開: 必要に応じてブランチを切り替え"
elif [ -n "$RECENT_ISSUE" ]; then
    echo "  1. Issue #$RECENT_ISSUE の作業再開"
    echo "     - Issue詳細確認: gh issue view $RECENT_ISSUE"
    echo "     - PROGRESS.md更新: 作業開始を記録"
else
    echo "  1. 新しい作業の開始:"
    echo "     - Issue確認: gh issue list --state open"
    echo "     - 新規Issue作成: gh issue create --title \"タイトル\""
    echo "     - PROGRESS.md更新: 新しいIssueの記録"
fi

echo ""
echo "📝 作業開始前のチェックリスト:"
echo "  [ ] 作業対象のIssue番号を確認"
echo "  [ ] PROGRESS.mdに作業開始を記録"
echo "  [ ] 必要に応じてブランチを作成・切り替え"
echo "  [ ] Issue番号付きコミットの準備"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ セッション開始チェック完了"
echo "💡 ヒント: 作業中は git commit -m \"feat: Issue #番号 - 内容\" でコミット"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0