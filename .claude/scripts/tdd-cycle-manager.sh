#!/bin/bash
#
# TDDサイクル管理スクリプト
# 
# @description Red→Green→Refactorサイクルの追跡・管理・レポート機能
# @usage ./tdd-cycle-manager.sh <command> [args]
# @see CLAUDE.md - TDD必須ルール
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TDD_STATE_DIR=".claude/tdd-state"
TDD_PHASE_FILE="$TDD_STATE_DIR/current-phase"
TDD_HISTORY_FILE="$TDD_STATE_DIR/cycle-history.json"
TDD_STATS_FILE="$TDD_STATE_DIR/daily-stats.json"

# ディレクトリ作成
mkdir -p "$TDD_STATE_DIR"

# コマンドライン引数
COMMAND="${1:-status}"
shift || true

# 現在時刻（ISO形式）
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TODAY=$(date +"%Y-%m-%d")

# 関数：フェーズ設定
set_phase() {
    local phase="$1"
    local description="${2:-}"
    
    case "$phase" in
        "red"|"RED")
            PHASE_EMOJI="🔴"
            PHASE_NAME="RED"
            PHASE_DESC="失敗するテストを作成"
            ;;
        "green"|"GREEN")
            PHASE_EMOJI="🟢"
            PHASE_NAME="GREEN"
            PHASE_DESC="テストを通す最小実装"
            ;;
        "refactor"|"REFACTOR")
            PHASE_EMOJI="🔵"
            PHASE_NAME="REFACTOR"
            PHASE_DESC="実装を改善・最適化"
            ;;
        *)
            echo "❌ 無効なフェーズ: $phase"
            echo "💡 有効な値: red, green, refactor"
            exit 1
            ;;
    esac
    
    # フェーズファイル更新
    echo "${PHASE_EMOJI} ${PHASE_NAME}" > "$TDD_PHASE_FILE"
    
    # 履歴記録
    HISTORY_ENTRY=$(cat <<EOF
{
    "timestamp": "$CURRENT_TIME",
    "phase": "$PHASE_NAME",
    "description": "${description:-$PHASE_DESC}",
    "emoji": "$PHASE_EMOJI"
}
EOF
)
    
    # 履歴ファイル更新
    if [[ -f "$TDD_HISTORY_FILE" ]]; then
        # 既存履歴に追加
        jq ". += [$HISTORY_ENTRY]" "$TDD_HISTORY_FILE" > "${TDD_HISTORY_FILE}.tmp" && mv "${TDD_HISTORY_FILE}.tmp" "$TDD_HISTORY_FILE"
    else
        # 新規履歴作成
        echo "[$HISTORY_ENTRY]" > "$TDD_HISTORY_FILE"
    fi
    
    echo "${PHASE_EMOJI} TDDフェーズ設定: $PHASE_NAME"
    echo "📝 説明: ${description:-$PHASE_DESC}"
}

# 関数：現在状況表示
show_status() {
    echo "🧪 TDDサイクル状況レポート"
    echo "=========================="
    
    if [[ -f "$TDD_PHASE_FILE" ]]; then
        CURRENT_PHASE=$(cat "$TDD_PHASE_FILE")
        echo "📊 現在のフェーズ: $CURRENT_PHASE"
    else
        echo "📊 現在のフェーズ: 未設定"
        echo "💡 新しいサイクルを開始: ./tdd-cycle-manager.sh red"
        return
    fi
    
    # 最近の履歴表示
    if [[ -f "$TDD_HISTORY_FILE" ]]; then
        echo ""
        echo "📈 最近のサイクル履歴:"
        jq -r '.[-5:] | .[] | "\(.emoji) \(.phase) - \(.timestamp | split("T")[0]) \(.timestamp | split("T")[1] | split("Z")[0])"' "$TDD_HISTORY_FILE" 2>/dev/null | sed 's/^/  /'
    fi
    
    # 今日の統計
    show_daily_stats
    
    # 次のステップ提案
    echo ""
    echo "🎯 推奨次ステップ:"
    case "$CURRENT_PHASE" in
        *"RED"*)
            echo "  🟢 green - テストを通す最小実装を開始"
            ;;
        *"GREEN"*)
            echo "  🔵 refactor - 実装を改善・最適化"
            ;;
        *"REFACTOR"*)
            echo "  🔴 red - 次の機能の失敗テストを作成"
            ;;
    esac
}

# 関数：日次統計
show_daily_stats() {
    echo ""
    echo "📊 本日の TDD統計 ($TODAY):"
    
    if [[ -f "$TDD_HISTORY_FILE" ]]; then
        TODAY_CYCLES=$(jq "[.[] | select(.timestamp | startswith(\"$TODAY\"))]" "$TDD_HISTORY_FILE" 2>/dev/null || echo "[]")
        
        RED_COUNT=$(echo "$TODAY_CYCLES" | jq '[.[] | select(.phase == "RED")] | length' 2>/dev/null || echo "0")
        GREEN_COUNT=$(echo "$TODAY_CYCLES" | jq '[.[] | select(.phase == "GREEN")] | length' 2>/dev/null || echo "0")
        REFACTOR_COUNT=$(echo "$TODAY_CYCLES" | jq '[.[] | select(.phase == "REFACTOR")] | length' 2>/dev/null || echo "0")
        
        echo "  🔴 Red フェーズ: ${RED_COUNT}回"
        echo "  🟢 Green フェーズ: ${GREEN_COUNT}回"
        echo "  🔵 Refactor フェーズ: ${REFACTOR_COUNT}回"
        
        COMPLETE_CYCLES=$((RED_COUNT < GREEN_COUNT ? RED_COUNT : GREEN_COUNT))
        if [[ $COMPLETE_CYCLES -gt 0 ]]; then
            echo "  🏆 完了サイクル: ${COMPLETE_CYCLES}回"
            echo "  ⭐ TDD品質スコア: $((COMPLETE_CYCLES * 100 / (RED_COUNT + GREEN_COUNT + REFACTOR_COUNT)))%"
        fi
    else
        echo "  📋 まだ記録がありません"
    fi
}

# 関数：レポート生成
generate_report() {
    local period="${1:-7}" # デフォルト7日間
    
    echo "📈 TDD活動レポート (過去${period}日間)"
    echo "================================="
    
    if [[ ! -f "$TDD_HISTORY_FILE" ]]; then
        echo "📋 レポートデータがありません"
        return
    fi
    
    # 期間計算
    START_DATE=$(date -d "${period} days ago" +"%Y-%m-%d")
    
    # 期間内データ抽出
    PERIOD_DATA=$(jq "[.[] | select(.timestamp >= \"$START_DATE\")]" "$TDD_HISTORY_FILE" 2>/dev/null || echo "[]")
    
    # 統計計算
    TOTAL_RED=$(echo "$PERIOD_DATA" | jq '[.[] | select(.phase == "RED")] | length')
    TOTAL_GREEN=$(echo "$PERIOD_DATA" | jq '[.[] | select(.phase == "GREEN")] | length')
    TOTAL_REFACTOR=$(echo "$PERIOD_DATA" | jq '[.[] | select(.phase == "REFACTOR")] | length')
    TOTAL_ACTIONS=$((TOTAL_RED + TOTAL_GREEN + TOTAL_REFACTOR))
    
    echo "📊 フェーズ別統計:"
    echo "  🔴 Red: $TOTAL_RED回"
    echo "  🟢 Green: $TOTAL_GREEN回"
    echo "  🔵 Refactor: $TOTAL_REFACTOR回"
    echo "  📝 総アクション: $TOTAL_ACTIONS回"
    
    # 完了サイクル数
    COMPLETE_CYCLES=$((TOTAL_RED < TOTAL_GREEN ? TOTAL_RED : TOTAL_GREEN))
    echo "  🏆 完了サイクル: ${COMPLETE_CYCLES}回"
    
    # 品質指標
    if [[ $TOTAL_ACTIONS -gt 0 ]]; then
        TDD_QUALITY=$((COMPLETE_CYCLES * 100 / TOTAL_ACTIONS))
        echo "  ⭐ TDD品質スコア: ${TDD_QUALITY}%"
        
        if [[ $TDD_QUALITY -ge 80 ]]; then
            echo "  🎉 優秀なTDD実践です！"
        elif [[ $TDD_QUALITY -ge 60 ]]; then
            echo "  👍 良好なTDD実践です"
        else
            echo "  💪 TDD実践の改善余地があります"
        fi
    fi
    
    # 日別アクティビティ
    echo ""
    echo "📅 日別アクティビティ:"
    echo "$PERIOD_DATA" | jq -r 'group_by(.timestamp | split("T")[0]) | .[] | "\(.[0].timestamp | split("T")[0]): \(length)回"' | sed 's/^/  /'
}

# 関数：ヘルプ表示
show_help() {
    cat <<EOF
🧪 TDD サイクル管理ツール

使用方法:
  $0 <command> [options]

コマンド:
  red           Red フェーズ開始（失敗するテスト作成）
  green         Green フェーズ開始（テスト通す実装）
  refactor      Refactor フェーズ開始（実装改善）
  status        現在のTDD状況表示（デフォルト）
  report [N]    過去N日間のレポート生成（デフォルト7日）
  reset         TDD状態をリセット
  help          このヘルプを表示

環境変数:
  TDD_STRICT_MODE     TDD厳格モード（true/false）
  TDD_AUTO_CYCLE      自動サイクル進行（true/false）

例:
  $0 red "ユーザー認証のテスト作成"
  $0 green "認証ロジック実装"
  $0 refactor "コードクリーンアップ"
  $0 report 14
EOF
}

# 関数：リセット
reset_tdd_state() {
    echo "🗑️  TDD状態をリセットしますか？ (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -rf "$TDD_STATE_DIR"
        echo "✅ TDD状態をリセットしました"
    else
        echo "ℹ️  リセットをキャンセルしました"
    fi
}

# メインロジック
case "$COMMAND" in
    "red"|"green"|"refactor")
        DESCRIPTION="${1:-}"
        set_phase "$COMMAND" "$DESCRIPTION"
        ;;
    "status")
        show_status
        ;;
    "report")
        PERIOD="${1:-7}"
        generate_report "$PERIOD"
        ;;
    "reset")
        reset_tdd_state
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo "❌ 不明なコマンド: $COMMAND"
        echo "💡 ヘルプ: $0 help"
        exit 1
        ;;
esac