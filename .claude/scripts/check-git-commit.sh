#!/bin/bash
# git commit実行前チェックスクリプト
# コミット前にPROGRESS.mdの更新を確認とIssue番号チェック

# 標準入力からコマンドを読み取る
read -r COMMAND

# git commitコマンドかチェック
if echo "$COMMAND" | grep -q "git commit"; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 コミット前チェックリスト"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # コミットメッセージからIssue番号を抽出
    COMMIT_MSG=$(echo "$COMMAND" | sed -n 's/.*-m "\(.*\)".*/\1/p')
    
    # Issue番号チェック（#数字 または Issue #数字のパターン）
    if echo "$COMMIT_MSG" | grep -qE "(Issue )?#[0-9]+"; then
        echo "✅ Issue番号が含まれています"
    else
        echo "❌ Issue番号が含まれていません！"
        echo ""
        echo "⚠️  警告: すべてのコミットにはIssue番号が必要です"
        echo ""
        echo "正しい形式:"
        echo "   feat: Issue #XX - 実装内容の概要"
        echo "   fix: Issue #XX - バグ修正の概要"
        echo "   docs: Issue #XX - ドキュメント更新の概要"
        echo "   chore: Issue #XX - その他の変更"
        echo ""
        echo "💡 ヒント: 小さな修正でも、対応するIssueを作成してから作業しましょう"
        echo ""
        echo "このまま続行しますか？ [y/N]"
        # インタラクティブな確認を表示（実際の実行はClaudeが判断）
    fi
    
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