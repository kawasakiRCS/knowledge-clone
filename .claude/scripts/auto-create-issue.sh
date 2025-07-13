#!/bin/bash
#
# AI主導 Issue 自動作成スクリプト
#
# 目的: ファイル変更内容を分析してGitHub Issueを自動作成
# 使用方法: ./auto-create-issue.sh [説明文]
#

# 作業ディレクトリに移動
cd /home/ubuntu01/workspace/knowledge 2>/dev/null || cd /home/ubuntu01/workspace/knowledge/nextjs 2>/dev/null

echo ""
echo "🤖 Issue 自動作成開始..."

# GitHub CLIの存在確認
if ! command -v gh &> /dev/null; then
    echo "❌ ERROR: GitHub CLI (gh) がインストールされていません"
    echo "インストール方法: https://cli.github.com/"
    exit 1
fi

# Git リポジトリかどうか確認
if ! git rev-parse --git-dir &> /dev/null; then
    echo "❌ ERROR: Gitリポジトリではありません"
    exit 1
fi

# 1. 変更されたファイルを分析
CHANGED_FILES=$(git status --porcelain 2>/dev/null)

if [ -z "$CHANGED_FILES" ]; then
    echo "⚠️  変更されたファイルがありません"
    exit 0
fi

echo "📝 変更されたファイル:"
echo "$CHANGED_FILES"

# 2. 変更内容を分析してIssueタイトルを生成
DESCRIPTION="$1"
if [ -z "$DESCRIPTION" ]; then
    # 変更されたファイルから自動的にタイトルを生成
    MODIFIED_FILES=$(echo "$CHANGED_FILES" | awk '{print $NF}' | head -3 | tr '\n' ' ')
    
    if echo "$MODIFIED_FILES" | grep -q "\.tsx\|\.ts\|\.jsx\|\.js"; then
        ISSUE_TYPE="feat"
        COMPONENT_NAME=$(echo "$MODIFIED_FILES" | grep -oE "[A-Z][a-zA-Z]*\.tsx?" | head -1 | sed 's/\..*//')
        if [ -n "$COMPONENT_NAME" ]; then
            DESCRIPTION="${COMPONENT_NAME}コンポーネントの実装・修正"
        else
            DESCRIPTION="フロントエンド機能の実装・修正"
        fi
    elif echo "$MODIFIED_FILES" | grep -q "\.java"; then
        ISSUE_TYPE="feat"
        DESCRIPTION="バックエンド機能の実装・修正"
    elif echo "$MODIFIED_FILES" | grep -q "\.md"; then
        ISSUE_TYPE="docs"
        DESCRIPTION="ドキュメント更新"
    elif echo "$MODIFIED_FILES" | grep -q "test"; then
        ISSUE_TYPE="test"
        DESCRIPTION="テストケース追加・修正"
    else
        ISSUE_TYPE="feat"
        DESCRIPTION="機能実装・修正"
    fi
else
    # フォーマットから推測
    if echo "$DESCRIPTION" | grep -qiE "fix|bug|バグ|修正"; then
        ISSUE_TYPE="fix"
    elif echo "$DESCRIPTION" | grep -qiE "test|テスト"; then
        ISSUE_TYPE="test"
    elif echo "$DESCRIPTION" | grep -qiE "doc|ドキュメント"; then
        ISSUE_TYPE="docs"
    else
        ISSUE_TYPE="feat"
    fi
fi

# 3. Issue番号を生成（タイムスタンプベース）
TIMESTAMP=$(date +%y%m%d%H%M)
ISSUE_NUMBER="AUTO-$TIMESTAMP"

# 4. Issue本文を生成
ISSUE_BODY="## 概要
$DESCRIPTION

## 変更されたファイル
\`\`\`
$CHANGED_FILES
\`\`\`

## 実装詳細
- [ ] 実装完了
- [ ] テスト作成・実行
- [ ] PROGRESS.md更新
- [ ] コミット実行

## 自動生成情報
- 作成日時: $(date '+%Y-%m-%d %H:%M:%S')
- 作業ブランチ: $(git branch --show-current 2>/dev/null || echo 'unknown')
- 最新コミット: $(git log --oneline -1 2>/dev/null || echo 'none')

このIssueは変更検出により自動作成されました。"

ISSUE_TITLE="$ISSUE_TYPE: $DESCRIPTION"

echo ""
echo "📋 作成するIssue情報:"
echo "  タイトル: $ISSUE_TITLE"
echo "  タイプ: $ISSUE_TYPE"
echo "  番号: $ISSUE_NUMBER"
echo ""

# 5. GitHub Issue作成実行
echo "🚀 GitHub Issue作成中..."

if CREATED_ISSUE=$(gh issue create --title "$ISSUE_TITLE" --body "$ISSUE_BODY" --label "$ISSUE_TYPE" 2>&1); then
    # Issue URLから番号を抽出
    REAL_ISSUE_NUMBER=$(echo "$CREATED_ISSUE" | grep -oE "[0-9]+$" || echo "")
    
    if [ -n "$REAL_ISSUE_NUMBER" ]; then
        echo "✅ Issue作成成功: #$REAL_ISSUE_NUMBER"
        echo "🔗 URL: $CREATED_ISSUE"
        
        # 6. PROGRESS.mdに記録
        if [ -f "PROGRESS.md" ]; then
            echo "" >> PROGRESS.md
            echo "## Issue #$REAL_ISSUE_NUMBER - $DESCRIPTION" >> PROGRESS.md
            echo "- 作成日時: $(date '+%Y-%m-%d %H:%M:%S')" >> PROGRESS.md
            echo "- ステータス: 作業中" >> PROGRESS.md
            echo "- 変更ファイル: $MODIFIED_FILES" >> PROGRESS.md
            echo "- 自動作成: ✅" >> PROGRESS.md
            echo "" >> PROGRESS.md
            
            echo "📝 PROGRESS.md に記録しました"
        fi
        
        echo ""
        echo "💡 次のステップ:"
        echo "  1. 作業完了後: git add -A"
        echo "  2. コミット: git commit -m \"$ISSUE_TYPE: Issue #$REAL_ISSUE_NUMBER - $DESCRIPTION\""
        echo "  3. Issue更新: gh issue comment $REAL_ISSUE_NUMBER --body \"実装完了\""
        echo "  4. Issueクローズ: gh issue close $REAL_ISSUE_NUMBER"
        echo ""
        
    else
        echo "⚠️  Issue作成されましたが番号の取得に失敗: $CREATED_ISSUE"
    fi
else
    echo "❌ Issue作成失敗: $CREATED_ISSUE"
    exit 1
fi

echo "✅ Issue自動作成完了"
echo ""

exit 0