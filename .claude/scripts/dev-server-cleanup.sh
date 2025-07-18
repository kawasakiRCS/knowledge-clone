#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# 開発サーバークリーンアップスクリプト
# 
# @description 開発サーバーの停止・クリーンアップ機能を提供
# @usage dev-server-cleanup.sh [command] [options]
# @version 1.0.0
# =============================================================================

# 共通ユーティリティの読み込み
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=dev-server-utils.sh
source "${SCRIPT_DIR}/dev-server-utils.sh"

# =============================================================================
# コマンド定義
# =============================================================================

show_usage() {
  cat << EOF
開発サーバークリーンアップツール

使用方法:
  $0 [command] [options]

コマンド:
  session-end           セッション終了時のクリーンアップ
  stop <pid>           指定PIDのサーバーを停止
  stop-all             全ての開発サーバーを停止
  cleanup-orphaned     孤立プロセスのクリーンアップ
  cleanup-state        状態ファイルのクリーンアップ
  status               現在の状況を表示
  help                 このヘルプを表示

オプション:
  --force              確認なしで実行
  --timeout <seconds>  停止タイムアウト (デフォルト: 10秒)
  --quiet              静音モード

環境変数:
  DEV_SERVER_AUTO_CLEANUP=true    自動クリーンアップを有効化
  DEV_SERVER_CLEANUP_TIMEOUT=N    デフォルトタイムアウト設定

例:
  $0 session-end                 # セッション終了時の処理
  $0 stop 12345                  # PID 12345 のサーバーを停止
  $0 stop-all --force            # 全サーバーを確認なしで停止
  $0 cleanup-orphaned            # 孤立プロセスをクリーンアップ
  $0 status                      # 現在の状況を表示

EOF
}

# =============================================================================
# セッション終了時処理
# =============================================================================

handle_session_end() {
  local force="${1:-false}"
  local exit_code=0
  
  log_info "セッション終了処理を開始"
  
  # アクティブサーバーの確認
  local active_servers
  if ! active_servers=$(get_active_servers); then
    log_warn "アクティブサーバーの取得に失敗しましたが、処理を継続します"
    active_servers="[]"
  fi
  
  if [[ "$active_servers" == "[]" ]] || [[ -z "$active_servers" ]]; then
    log_info "アクティブな開発サーバーはありません"
    cleanup_state_files || {
      log_warn "状態ファイルのクリーンアップで警告が発生しましたが、正常終了します"
    }
    log_debug "セッション終了処理が正常に完了しました (exit_code=0)"
    return 0
  fi
  
  # サーバー情報表示
  echo ""
  echo "🔍 アクティブな開発サーバーが検出されました:"
  echo ""
  
  local server_count=0
  while IFS= read -r server_info; do
    [[ -z "$server_info" ]] && continue
    ((server_count++))
    
    local pid port project_path start_time
    pid=$(echo "$server_info" | jq -r '.pid')
    port=$(echo "$server_info" | jq -r '.port')
    project_path=$(echo "$server_info" | jq -r '.projectPath')
    start_time=$(echo "$server_info" | jq -r '.startTime')
    
    local duration
    duration=$(format_duration "$start_time")
    
    echo "   🚀 PID: $pid - ポート: $port - 実行時間: $duration"
    echo "      プロジェクト: $project_path"
  done <<< "$(echo "$active_servers" | jq -c '.[]?' 2>/dev/null || echo "")"
  
  echo ""
  
  # 自動クリーンアップ設定確認
  if [[ "${DEV_SERVER_AUTO_CLEANUP:-}" == "true" ]] || [[ "$force" == "true" ]]; then
    echo "🤖 自動クリーンアップを実行します..."
    if ! stop_all_servers "true"; then
      log_warn "一部のサーバー停止で問題が発生しましたが、処理を継続します"
      exit_code=0  # 警告レベルのため正常終了とする
    fi
  else
    echo "💡 ヒント: 自動クリーンアップを有効にするには DEV_SERVER_AUTO_CLEANUP=true を設定してください"
    echo "⚠️  開発サーバーが起動したままです。手動で停止するには:"
    echo "   .claude/scripts/dev-server-cleanup.sh stop-all"
    echo ""
  fi
  
  # 最終的な状態ファイルクリーンアップ
  cleanup_state_files || {
    log_warn "状態ファイルのクリーンアップで警告が発生しましたが、正常終了します"
  }
  
  log_debug "セッション終了処理が完了しました (exit_code=$exit_code)"
  return $exit_code
}

# =============================================================================
# サーバー停止機能
# =============================================================================

stop_server() {
  local pid="$1"
  local timeout="${2:-10}"
  
  if ! is_dev_server_process "$pid"; then
    log_error "PID $pid は開発サーバープロセスではありません"
    return 1
  fi
  
  echo "🛑 サーバー停止中: PID $pid"
  
  if stop_process_gracefully "$pid" "$timeout"; then
    echo "✅ サーバーを正常に停止しました: PID $pid"
    return 0
  else
    echo "❌ サーバーの停止に失敗しました: PID $pid"
    return 1
  fi
}

stop_all_servers() {
  local force="${1:-false}"
  local timeout="${2:-10}"
  
  local active_servers
  active_servers=$(get_active_servers)
  
  if [[ "$active_servers" == "[]" ]] || [[ -z "$active_servers" ]]; then
    echo "ℹ️  停止対象のサーバーはありません"
    return 0
  fi
  
  # 確認プロンプト
  if [[ "$force" != "true" ]]; then
    local server_count
    server_count=$(echo "$active_servers" | jq '. | length' 2>/dev/null || echo "0")
    
    echo "⚠️  $server_count 個の開発サーバーを停止しますか? (y/N)"
    read -r response
    
    case "${response,,}" in
      y|yes)
        echo "停止処理を開始します..."
        ;;
      *)
        echo "キャンセルしました"
        return 0
        ;;
    esac
  fi
  
  # 全サーバー停止
  local success_count=0
  local total_count=0
  
  while IFS= read -r server_info; do
    [[ -z "$server_info" ]] && continue
    ((total_count++))
    
    local pid
    pid=$(echo "$server_info" | jq -r '.pid')
    
    if stop_process_gracefully "$pid" "$timeout"; then
      ((success_count++))
      echo "✅ 停止完了: PID $pid"
    else
      echo "❌ 停止失敗: PID $pid"
    fi
  done <<< "$(echo "$active_servers" | jq -c '.[]?' 2>/dev/null || echo "")"
  
  echo ""
  echo "📊 停止結果: $success_count/$total_count 個のサーバーを停止"
  
  if [[ $success_count -eq $total_count ]]; then
    echo "✅ 全てのサーバーを正常に停止しました"
  else
    echo "⚠️  一部のサーバーの停止に失敗しました"
  fi
}

# =============================================================================
# 孤立プロセス処理
# =============================================================================

cleanup_orphaned_processes() {
  local force="${1:-false}"
  local timeout="${2:-10}"
  
  log_info "孤立プロセスのチェックを開始"
  
  # 現在のプロセス一覧取得
  local current_processes
  current_processes=$(detect_dev_servers)
  
  # 管理対象プロセス一覧取得
  local managed_pids=()
  if [[ -d "$PIDS_DIR" ]]; then
    for pid_file in "$PIDS_DIR"/*.pid; do
      [[ ! -f "$pid_file" ]] && continue
      
      local pid
      pid=$(jq -r '.pid' "$pid_file" 2>/dev/null || echo "")
      [[ -n "$pid" ]] && managed_pids+=("$pid")
    done
  fi
  
  # 孤立プロセス検出
  local orphaned_pids=()
  
  while IFS= read -r process; do
    [[ -z "$process" ]] && continue
    
    local pid
    pid=$(get_process_pid "$process")
    
    # 管理対象外のプロセスは孤立とみなす
    local is_managed=false
    for managed_pid in "${managed_pids[@]}"; do
      if [[ "$pid" == "$managed_pid" ]]; then
        is_managed=true
        break
      fi
    done
    
    if [[ "$is_managed" == "false" ]]; then
      orphaned_pids+=("$pid")
    fi
  done <<< "$current_processes"
  
  if [[ ${#orphaned_pids[@]} -eq 0 ]]; then
    echo "ℹ️  孤立プロセスは検出されませんでした"
    return 0
  fi
  
  # 孤立プロセス表示
  echo ""
  echo "🔍 孤立プロセスが検出されました:"
  
  for pid in "${orphaned_pids[@]}"; do
    local cmd
    cmd=$(ps -p "$pid" -o args= 2>/dev/null || echo "不明")
    echo "   🚀 PID: $pid - コマンド: $(echo "$cmd" | cut -c1-60)..."
  done
  
  echo ""
  
  # 確認プロンプト
  if [[ "$force" != "true" ]]; then
    echo "⚠️  ${#orphaned_pids[@]} 個の孤立プロセスを停止しますか? (y/N)"
    read -r response
    
    case "${response,,}" in
      y|yes)
        echo "停止処理を開始します..."
        ;;
      *)
        echo "キャンセルしました"
        return 0
        ;;
    esac
  fi
  
  # 孤立プロセス停止
  local success_count=0
  
  for pid in "${orphaned_pids[@]}"; do
    if stop_process_gracefully "$pid" "$timeout"; then
      ((success_count++))
      echo "✅ 孤立プロセス停止: PID $pid"
    else
      echo "❌ 停止失敗: PID $pid"
    fi
  done
  
  echo ""
  echo "📊 停止結果: $success_count/${#orphaned_pids[@]} 個の孤立プロセスを停止"
}

# =============================================================================
# 状態ファイルクリーンアップ
# =============================================================================

cleanup_state_files() {
  log_debug "状態ファイルのクリーンアップを開始"
  
  if [[ ! -d "$PIDS_DIR" ]]; then
    return 0
  fi
  
  local cleaned_count=0
  
  for pid_file in "$PIDS_DIR"/*.pid; do
    [[ ! -f "$pid_file" ]] && continue
    
    local pid
    pid=$(jq -r '.pid' "$pid_file" 2>/dev/null || echo "")
    
    if [[ -z "$pid" ]] || ! is_dev_server_process "$pid"; then
      rm -f "$pid_file"
      ((cleaned_count++))
      log_debug "無効なPIDファイルを削除: $(basename "$pid_file")"
    fi
  done
  
  # アクティブサーバーリスト更新
  update_active_servers_list
  
  if [[ $cleaned_count -gt 0 ]]; then
    log_info "$cleaned_count 個の無効なPIDファイルを削除しました"
  fi
}

# =============================================================================
# ステータス表示
# =============================================================================

show_status() {
  echo "🔍 開発サーバー状況レポート"
  echo "================================"
  echo ""
  
  # アクティブサーバー
  local active_servers
  active_servers=$(get_active_servers)
  
  if [[ "$active_servers" == "[]" ]] || [[ -z "$active_servers" ]]; then
    echo "📊 アクティブサーバー: なし"
  else
    local server_count
    server_count=$(echo "$active_servers" | jq '. | length' 2>/dev/null || echo "0")
    echo "📊 アクティブサーバー: $server_count 個"
    echo ""
    
    while IFS= read -r server_info; do
      [[ -z "$server_info" ]] && continue
      
      local pid port project_path start_time session_id
      pid=$(echo "$server_info" | jq -r '.pid')
      port=$(echo "$server_info" | jq -r '.port')
      project_path=$(echo "$server_info" | jq -r '.projectPath')
      start_time=$(echo "$server_info" | jq -r '.startTime')
      session_id=$(echo "$server_info" | jq -r '.sessionId')
      
      local duration
      duration=$(format_duration "$start_time")
      
      echo "   🚀 PID: $pid"
      echo "      ポート: $port"
      echo "      プロジェクト: $project_path"
      echo "      実行時間: $duration"
      echo "      セッション: $session_id"
      echo ""
    done <<< "$(echo "$active_servers" | jq -c '.[]?' 2>/dev/null || echo "")"
  fi
  
  # 使用中ポート
  local used_ports
  used_ports=$(get_used_ports)
  
  if [[ -n "$used_ports" ]]; then
    echo "🔌 使用中ポート:"
    while IFS= read -r port; do
      [[ -z "$port" ]] && continue
      local process_info
      process_info=$(get_port_process "$port")
      echo "   ポート $port: $process_info"
    done <<< "$used_ports"
  else
    echo "🔌 使用中ポート: なし"
  fi
  
  echo ""
  
  # 設定情報
  echo "⚙️  設定:"
  echo "   自動クリーンアップ: ${DEV_SERVER_AUTO_CLEANUP:-false}"
  echo "   タイムアウト: ${DEV_SERVER_CLEANUP_TIMEOUT:-10}秒"
  echo "   状態ディレクトリ: $DEV_SERVER_STATE_DIR"
  echo ""
}

# =============================================================================
# メイン処理
# =============================================================================

main() {
  local command="${1:-help}"
  local force=false
  local timeout="${DEV_SERVER_CLEANUP_TIMEOUT:-10}"
  local quiet=false
  
  # オプション解析
  shift || true
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --force)
        force=true
        shift
        ;;
      --timeout)
        timeout="$2"
        shift 2
        ;;
      --quiet)
        quiet=true
        LOG_LEVEL=0
        shift
        ;;
      *)
        break
        ;;
    esac
  done
  
  # コマンド実行
  case "$command" in
    "session-end")
      handle_session_end "$force"
      local result=$?
      log_debug "session-end command completed with exit code: $result"
      exit $result
      ;;
    "stop")
      if [[ $# -eq 0 ]]; then
        log_error "PIDを指定してください"
        echo "使用例: $0 stop 12345"
        exit 1
      fi
      stop_server "$1" "$timeout"
      ;;
    "stop-all")
      stop_all_servers "$force" "$timeout"
      ;;
    "cleanup-orphaned")
      cleanup_orphaned_processes "$force" "$timeout"
      ;;
    "cleanup-state")
      cleanup_state_files
      ;;
    "status")
      show_status
      ;;
    "help"|*)
      show_usage
      ;;
  esac
  
  # 明示的な正常終了
  exit 0
}

# =============================================================================
# スクリプト実行
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi