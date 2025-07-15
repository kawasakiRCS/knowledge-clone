#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# 開発サーバー監視スクリプト
# 
# @description hooks システムから呼び出される開発サーバー監視機能
# @usage echo "command" | dev-server-monitor.sh [pre|post]
# @version 1.0.0
# =============================================================================

# 共通ユーティリティの読み込み
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=dev-server-utils.sh
source "${SCRIPT_DIR}/dev-server-utils.sh"

# 監視モード
readonly MODE="${1:-pre}"

# =============================================================================
# 開発サーバーコマンド検出
# =============================================================================

is_dev_server_command() {
  local command="$1"
  
  # 開発サーバー起動パターン
  local dev_patterns=(
    "npm.*run.*dev"
    "npm.*dev"
    "pnpm.*run.*dev"
    "pnpm.*dev"
    "yarn.*dev"
    "next.*dev"
    "npx.*next.*dev"
  )
  
  for pattern in "${dev_patterns[@]}"; do
    if echo "$command" | grep -qE "$pattern"; then
      return 0
    fi
  done
  
  return 1
}

extract_port_from_command() {
  local command="$1"
  local port
  
  # -p または --port オプションから抽出
  if port=$(echo "$command" | grep -oE '\-(p|port)[[:space:]]+([0-9]+)' | grep -oE '[0-9]+$'); then
    echo "$port"
    return 0
  fi
  
  # --port=nnnn 形式から抽出
  if port=$(echo "$command" | grep -oE '\-\-port=([0-9]+)' | grep -oE '[0-9]+$'); then
    echo "$port"
    return 0
  fi
  
  # デフォルトポート
  echo "3000"
}

# =============================================================================
# プリフック処理 (Pre-Tool-Use)
# =============================================================================

handle_pre_hook() {
  local input_command="$1"
  
  log_debug "プリフック開始: $input_command"
  
  if ! is_dev_server_command "$input_command"; then
    log_debug "開発サーバーコマンドではありません"
    return 0
  fi
  
  log_info "開発サーバー起動コマンドを検出: $input_command"
  
  # 既存プロセス検出
  local existing_processes
  existing_processes=$(detect_dev_servers)
  
  if [[ -z "$existing_processes" ]]; then
    log_info "既存の開発サーバーは検出されませんでした"
    return 0
  fi
  
  # 既存プロセス情報表示
  display_existing_servers "$existing_processes" "$input_command"
  
  # ユーザー選択処理
  handle_user_choice "$existing_processes" "$input_command"
}

display_existing_servers() {
  local processes="$1"
  local new_command="$2"
  
  local new_port
  new_port=$(extract_port_from_command "$new_command")
  
  echo ""
  echo "⚠️  既存の開発サーバーが検出されました:"
  echo ""
  
  local count=0
  while IFS= read -r process; do
    [[ -z "$process" ]] && continue
    
    ((count++))
    local pid
    local cmd
    local port=""
    
    pid=$(get_process_pid "$process")
    cmd=$(get_process_command "$process")
    
    # ポート情報取得試行
    for test_port in "${DEFAULT_PORTS[@]}"; do
      if is_port_in_use "$test_port"; then
        local port_info
        port_info=$(get_port_process "$test_port")
        if [[ "$port_info" == *"$pid"* ]]; then
          port=" - ポート $test_port"
          break
        fi
      fi
    done
    
    # 実行時間計算
    local duration=""
    local pid_file="${PIDS_DIR}/${pid}.pid"
    if [[ -f "$pid_file" ]]; then
      local start_time
      start_time=$(jq -r '.startTime' "$pid_file" 2>/dev/null || echo "")
      if [[ -n "$start_time" ]]; then
        duration=" - 起動から$(format_duration "$start_time")"
      fi
    fi
    
    local cmd_type
    cmd_type=$(extract_command_type "$cmd")
    
    echo "   🚀 $cmd_type (PID: $pid)$port$duration"
    echo "      コマンド: $(echo "$cmd" | cut -c1-60)..."
    
  done <<< "$processes"
  
  echo ""
  
  # ポート競合警告
  for used_port in $(get_used_ports); do
    if [[ "$used_port" == "$new_port" ]]; then
      echo "🔴 ポート競合: 新しいサーバーが使用予定のポート $new_port は既に使用中です"
      echo ""
      break
    fi
  done
}

handle_user_choice() {
  local processes="$1"
  local new_command="$2"
  
  echo "選択してください:"
  echo "1) 既存サーバーを停止して新しいサーバーを起動"
  echo "2) 別のポートで新しいサーバーを起動"
  echo "3) キャンセル (既存サーバーをそのまま継続)"
  echo ""
  
  # 自動選択モード（非対話環境）
  if [[ "${DEV_SERVER_AUTO_STOP:-}" == "true" ]]; then
    echo "🤖 自動選択: 既存サーバーを停止"
    stop_existing_servers "$processes"
    return 0
  fi
  
  # 対話モード（開発環境では警告のみ）
  echo "💡 ヒント: 自動停止を有効にするには DEV_SERVER_AUTO_STOP=true を設定してください"
  echo "⚠️  このまま実行すると、ポート競合やプロセス重複が発生する可能性があります"
  echo ""
  
  return 0
}

stop_existing_servers() {
  local processes="$1"
  
  echo "🛑 既存サーバーを停止中..."
  
  while IFS= read -r process; do
    [[ -z "$process" ]] && continue
    
    local pid
    pid=$(get_process_pid "$process")
    
    if stop_process_gracefully "$pid" 5; then
      echo "✅ プロセス $pid を停止しました"
    else
      echo "❌ プロセス $pid の停止に失敗しました"
    fi
  done <<< "$processes"
  
  echo ""
}

# =============================================================================
# ポストフック処理 (Post-Tool-Use)
# =============================================================================

handle_post_hook() {
  local input_command="$1"
  
  log_debug "ポストフック開始: $input_command"
  
  if ! is_dev_server_command "$input_command"; then
    log_debug "開発サーバーコマンドではありません"
    return 0
  fi
  
  # 短時間待機（プロセス起動を待つ）
  sleep 2
  
  # 新しく起動したプロセスを検出
  local new_processes
  new_processes=$(detect_dev_servers)
  
  if [[ -z "$new_processes" ]]; then
    log_warn "開発サーバープロセスが検出されませんでした"
    return 0
  fi
  
  # 最新のプロセスを特定してPID保存
  local latest_pid=""
  local latest_time=0
  
  while IFS= read -r process; do
    [[ -z "$process" ]] && continue
    
    local pid
    pid=$(get_process_pid "$process")
    
    # プロセス開始時刻取得（簡易版）
    local start_time
    start_time=$(ps -o lstart= -p "$pid" 2>/dev/null | xargs -I {} date -d "{}" +%s 2>/dev/null || echo "0")
    
    if [[ "$start_time" -gt "$latest_time" ]]; then
      latest_time="$start_time"
      latest_pid="$pid"
    fi
  done <<< "$new_processes"
  
  if [[ -n "$latest_pid" ]]; then
    register_new_server "$latest_pid" "$input_command"
  fi
}

register_new_server() {
  local pid="$1"
  local command="$2"
  
  local port
  port=$(extract_port_from_command "$command")
  
  # 実際に使用されているポートを確認
  local actual_port=""
  for test_port in "${DEFAULT_PORTS[@]}"; do
    if is_port_in_use "$test_port"; then
      local port_info
      port_info=$(get_port_process "$test_port")
      if [[ "$port_info" == *"$pid"* ]]; then
        actual_port="$test_port"
        break
      fi
    fi
  done
  
  local final_port="${actual_port:-$port}"
  local project_path
  project_path=$(pwd)
  
  save_server_pid "$pid" "$final_port" "$project_path"
  
  echo ""
  echo "✅ 開発サーバーを登録しました:"
  echo "   🆔 PID: $pid"
  echo "   🔌 ポート: $final_port"
  echo "   📁 プロジェクト: $project_path"
  echo "   🕐 起動時刻: $(date)"
  echo ""
  echo "💡 サーバーを停止するには: .claude/scripts/dev-server-cleanup.sh stop $pid"
  echo ""
}

# =============================================================================
# メイン処理
# =============================================================================

main() {
  local input_command
  
  # 標準入力からコマンドを読み取り
  if [[ -t 0 ]]; then
    # 対話モード（テスト用）
    shift || true  # MODEをスキップ
    input_command="${*}"
  else
    # パイプモード（hooks から呼び出し）
    input_command=$(cat)
  fi
  
  if [[ -z "$input_command" ]]; then
    log_error "コマンドが指定されていません"
    return 1
  fi
  
  # モードに応じて処理分岐
  case "$MODE" in
    "pre")
      handle_pre_hook "$input_command"
      ;;
    "post")
      handle_post_hook "$input_command"
      ;;
    *)
      log_error "無効なモード: $MODE"
      echo "使用方法: $0 [pre|post]"
      return 1
      ;;
  esac
}

# =============================================================================
# スクリプト実行
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi