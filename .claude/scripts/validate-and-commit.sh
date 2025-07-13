#!/bin/bash
#
# 統合 Issue検証・コミット・更新スクリプト
#
# 目的: Issue検証 → PROGRESS.md更新 → コミット → Issue更新の完全自動化
# 使用方法: ./validate-and-commit.sh "コミットメッセージ" [issue_number]
#

# 作業ディレクトリに移動
cd /home/ubuntu01/workspace/knowledge 2>/dev/null || cd /home/ubuntu01/workspace/knowledge/nextjs 2>/dev/null

COMMIT_MSG="$1"
ISSUE_NUMBER="$2"

echo ""
echo "🔄 統合ワークフロー開始..."

# 1. 引数チェック
if [ -z "$COMMIT_MSG" ]; then
    echo "❌ ERROR: コミットメッセージが指定されていません"
    echo "使用方法: $0 \"コミットメッセージ\" [issue_number]"
    exit 1
fi

# 2. Issue番号の抽出・検証
if [ -n "$ISSUE_NUMBER" ]; then
    # 引数でIssue番号が指定された場合
    ISSUE_NUM="$ISSUE_NUMBER"
elif echo "$COMMIT_MSG" | grep -qE "#[0-9]+"; then
    # コミットメッセージからIssue番号を抽出
    ISSUE_NUM=$(echo "$COMMIT_MSG" | grep -oE "#[0-9]+" | head -1 | sed 's/#//')
else
    echo "❌ ERROR: Issue番号が見つかりません"
    echo "コミットメッセージに #番号 を含めるか、引数でIssue番号を指定してください"
    echo "例: $0 \"feat: Issue #123 - 機能追加\" 123"
    exit 1
fi

echo "🎯 対象Issue: #$ISSUE_NUM"

# 3. GitHubでIssue存在確認
if command -v gh &> /dev/null; then
    echo "📡 GitHub Issue確認中..."
    if gh issue view "$ISSUE_NUM" &> /dev/null; then
        ISSUE_TITLE=$(gh issue view "$ISSUE_NUM" --json title -q '.title' 2>/dev/null)
        ISSUE_STATE=$(gh issue view "$ISSUE_NUM" --json state -q '.state' 2>/dev/null)
        echo "✅ Issue確認完了: #$ISSUE_NUM - $ISSUE_TITLE"
        echo "📊 Issue状態: $ISSUE_STATE"
        
        if [ "$ISSUE_STATE" = "CLOSED" ]; then
            echo "⚠️  警告: Issue #$ISSUE_NUM は既にクローズされています"
            echo "継続しますか？ (y/n)"
            read -r CONTINUE
            if [ "$CONTINUE" != "y" ]; then
                echo "処理を中断しました"
                exit 1
            fi
        fi
    else
        echo "❌ ERROR: Issue #$ISSUE_NUM が見つかりません"
        echo "新しいIssueを作成しますか？ (y/n)"
        read -r CREATE_ISSUE
        if [ "$CREATE_ISSUE" = "y" ]; then
            echo "Issue作成中..."
            .claude/scripts/auto-create-issue.sh "$COMMIT_MSG"
            echo "新しいIssueが作成されました。コミットメッセージを更新してください。"
            exit 0
        else
            exit 1
        fi
    fi
else
    echo "⚠️  GitHub CLI が利用できません。Issue確認をスキップします。"
fi

# 4. 変更ファイルの確認
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null)
UNSTAGED_FILES=$(git diff --name-only 2>/dev/null)

if [ -z "$STAGED_FILES" ] && [ -z "$UNSTAGED_FILES" ]; then
    echo "⚠️  コミットする変更がありません"
    exit 0
fi

echo ""
echo "📝 変更ファイル:"
if [ -n "$STAGED_FILES" ]; then
    echo "  ステージング済み:"
    echo "$STAGED_FILES" | sed 's/^/    /'
fi
if [ -n "$UNSTAGED_FILES" ]; then
    echo "  未ステージング:"
    echo "$UNSTAGED_FILES" | sed 's/^/    /'
fi

# 5. 未ステージングファイルの自動追加
if [ -n "$UNSTAGED_FILES" ]; then
    echo ""
    echo "🔄 未ステージングファイルを自動追加中..."
    git add -A
    echo "✅ ファイル追加完了"
fi

# 6. PROGRESS.md更新
echo ""
echo "📋 PROGRESS.md更新中..."

if [ -f "PROGRESS.md" ]; then
    # 既存のPROGRESS.mdに追記
    {
        echo ""
        echo "### $(date '+%Y-%m-%d %H:%M:%S') - Issue #$ISSUE_NUM"
        echo "- **コミット**: $COMMIT_MSG"
        echo "- **変更ファイル**: $(git diff --cached --name-only | tr '\n' ' ')"
        echo "- **ステータス**: 実装完了"
        echo ""
    } >> PROGRESS.md
    
    git add PROGRESS.md
    echo "✅ PROGRESS.md更新完了"
else
    echo "⚠️  PROGRESS.md が見つかりません。作成をスキップします。"
fi

# 7. コミット実行
echo ""
echo "💾 コミット実行中..."

# Issue番号が含まれていない場合は追加
if ! echo "$COMMIT_MSG" | grep -qE "#[0-9]+"; then
    COMMIT_MSG="$COMMIT_MSG (Issue #$ISSUE_NUM)"
fi

if git commit -m "$COMMIT_MSG"; then
    echo "✅ コミット成功: $COMMIT_MSG"
    COMMIT_HASH=$(git rev-parse --short HEAD)
    echo "📦 コミットハッシュ: $COMMIT_HASH"
else
    echo "❌ コミット失敗"
    exit 1
fi

# 8. GitHub Issue更新
if command -v gh &> /dev/null && [ -n "$ISSUE_NUM" ]; then
    echo ""
    echo "📡 GitHub Issue更新中..."
    
    COMMENT_BODY="## 作業完了報告

**コミット**: $COMMIT_MSG
**ハッシュ**: $COMMIT_HASH
**完了時刻**: $(date '+%Y-%m-%d %H:%M:%S')

**変更ファイル**:
\`\`\`
$(git diff --name-only HEAD~1 HEAD)
\`\`\`

実装が完了しました。レビューお願いします。"

    if gh issue comment "$ISSUE_NUM" --body "$COMMENT_BODY"; then
        echo "✅ Issue #$ISSUE_NUM にコメント追加完了"
        
        # Issueを自動クローズするか確認
        echo ""
        echo "Issue #$ISSUE_NUM をクローズしますか？ (y/n)"
        read -r CLOSE_ISSUE
        if [ "$CLOSE_ISSUE" = "y" ]; then
            if gh issue close "$ISSUE_NUM"; then
                echo "✅ Issue #$ISSUE_NUM をクローズしました"
            else
                echo "❌ Issue クローズに失敗しました"
            fi
        fi
    else
        echo "❌ Issue更新に失敗しました"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 統合ワークフロー完了"
echo "📊 処理サマリー:"
echo "  - Issue: #$ISSUE_NUM"
echo "  - コミット: $COMMIT_MSG"
echo "  - ファイル: $(git diff --name-only HEAD~1 HEAD | wc -l) 件"
echo "  - 時刻: $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0