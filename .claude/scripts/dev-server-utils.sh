#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# 開発サーバー管理ユーティリティ
# 
# @description プロセス管理、ポート確認、状態管理などの共通機能を提供
# @version 1.0.0
# =============================================================================

# 共通設定
readonly DEV_SERVER_STATE_DIR="${CLAUDE_DIR:-$(pwd)/.claude}/dev-server-state"
readonly PIDS_DIR="${DEV_SERVER_STATE_DIR}/pids"
readonly ACTIVE_SERVERS_FILE="${DEV_SERVER_STATE_DIR}/active-servers.json"
readonly PORTS_FILE="${DEV_SERVER_STATE_DIR}/ports.json"

# 監視対象ポート範囲
readonly DEFAULT_PORTS=(3000 3001 3002 3003 3004 3005)

# プロセス検出パターン
readonly DEV_SERVER_PATTERNS=(
  "next.*dev"
  "node.*dev"
  "npm.*dev"
  "pnpm.*dev"
  "yarn.*dev"
  "npx.*dev"
)

# ログレベル
readonly LOG_ERROR=0
readonly LOG_WARN=1
readonly LOG_INFO=2
readonly LOG_DEBUG=3
LOG_LEVEL=${DEV_SERVER_LOG_LEVEL:-2}

# =============================================================================
# ログ出力関数
# =============================================================================

log_error() {
  [[ $LOG_LEVEL -ge $LOG_ERROR ]] && echo "❌ ERROR: $*" >&2
  return 0
}

log_warn() {
  [[ $LOG_LEVEL -ge $LOG_WARN ]] && echo "⚠️  WARNING: $*" >&2
  return 0
}

log_info() {
  [[ $LOG_LEVEL -ge $LOG_INFO ]] && echo "ℹ️  INFO: $*" >&2
  return 0
}

log_debug() {
  [[ $LOG_LEVEL -ge $LOG_DEBUG ]] && echo "🔍 DEBUG: $*" >&2
  return 0
}

# =============================================================================
# 初期化関数
# =============================================================================

init_dev_server_state() {
  local state_dir="$1"
  
  # ディレクトリ作成
  mkdir -p "$state_dir"
  mkdir -p "${state_dir}/pids"
  
  # 初期状態ファイル作成
  if [[ ! -f "$ACTIVE_SERVERS_FILE" ]]; then
    local timestamp
    timestamp=$(date -Iseconds)
    jq -n --arg timestamp "$timestamp" '{"activeServers": [], "lastUpdated": $timestamp, "version": "1.0.0"}' > "$ACTIVE_SERVERS_FILE"
    log_debug "初期化: $ACTIVE_SERVERS_FILE を作成"
  fi
  
  if [[ ! -f "$PORTS_FILE" ]]; then
    echo '{"portHistory": []}' > "$PORTS_FILE"
    log_debug "初期化: $PORTS_FILE を作成"
  fi
}

# =============================================================================
# プロセス検出関数
# =============================================================================

detect_dev_servers() {
  local processes=()
  
  for pattern in "${DEV_SERVER_PATTERNS[@]}"; do
    while IFS= read -r line; do
      [[ -n "$line" ]] && processes+=("$line")
    done < <(ps aux | grep -E "$pattern" | grep -v grep | grep -v "dev-server" || true)
  done
  
  printf '%s\n' "${processes[@]}"
  return 0
}

get_process_pid() {
  local process_line="$1"
  echo "$process_line" | awk '{print $2}'
  return 0
}

get_process_command() {
  local process_line="$1"
  echo "$process_line" | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}'
  return 0
}

is_dev_server_process() {
  local pid="$1"
  
  if ! kill -0 "$pid" 2>/dev/null; then
    return 1
  fi
  
  local cmd
  cmd=$(ps -p "$pid" -o comm= 2>/dev/null || echo "")
  
  case "$cmd" in
    node|next|npm|pnpm|yarn|npx)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# =============================================================================
# ポート管理関数
# =============================================================================

get_used_ports() {
  local ports=()
  
  for port in "${DEFAULT_PORTS[@]}"; do
    if is_port_in_use "$port"; then
      ports+=("$port")
    fi
  done
  
  printf '%s\n' "${ports[@]}"
  return 0
}

is_port_in_use() {
  local port="$1"
  ss -tlnp | grep -q ":${port} " 2>/dev/null
  return $?
}

get_port_process() {
  local port="$1"
  local result
  
  result=$(ss -tlnp | grep ":${port} " | head -1 || echo "")
  if [[ -n "$result" ]]; then
    echo "$result" | sed -n 's/.*users:(("\([^"]*\)",pid=\([0-9]*\),.*/\1:\2/p'
  fi
  return 0
}

find_available_port() {
  local start_port="${1:-3000}"
  local max_attempts="${2:-100}"
  
  for ((i = 0; i < max_attempts; i++)); do
    local port=$((start_port + i))
    if ! is_port_in_use "$port"; then
      echo "$port"
      return 0
    fi
  done
  
  return 1
}

# =============================================================================
# PID管理関数
# =============================================================================

save_server_pid() {
  local pid="$1"
  local port="$2"
  local project_path="${3:-$(pwd)}"
  local session_id="${4:-$USER-$$}"
  
  init_dev_server_state "$DEV_SERVER_STATE_DIR"
  
  local pid_file="${PIDS_DIR}/${pid}.pid"
  local timestamp
  timestamp=$(date -Iseconds)
  
  # PIDファイル作成
  cat > "$pid_file" <<EOF
{
  "pid": $pid,
  "port": $port,
  "projectPath": "$project_path",
  "sessionId": "$session_id",
  "startTime": "$timestamp"
}
EOF

  # アクティブサーバーリスト更新
  update_active_servers_list
  
  log_debug "PID保存: $pid (ポート $port)"
}

remove_server_pid() {
  local pid="$1"
  local pid_file="${PIDS_DIR}/${pid}.pid"
  
  if [[ -f "$pid_file" ]]; then
    rm -f "$pid_file"
    log_debug "PID削除: $pid"
  fi
  
  update_active_servers_list
}

update_active_servers_list() {
  init_dev_server_state "$DEV_SERVER_STATE_DIR"
  
  local active_servers="[]"
  
  if [[ -d "$PIDS_DIR" ]]; then
    local servers=()
    
    for pid_file in "$PIDS_DIR"/*.pid; do
      [[ ! -f "$pid_file" ]] && continue
      
      local pid_data
      if pid_data=$(cat "$pid_file" 2>/dev/null); then
        local pid
        pid=$(echo "$pid_data" | jq -r '.pid' 2>/dev/null || echo "")
        
        if [[ -n "$pid" ]] && is_dev_server_process "$pid"; then
          servers+=("$pid_data")
        else
          # 無効なPIDファイルを削除
          rm -f "$pid_file"
        fi
      fi
    done
    
    if [[ ${#servers[@]} -gt 0 ]]; then
      active_servers=$(printf '%s\n' "${servers[@]}" | jq -s '.')
    fi
  fi
  
  jq --argjson servers "$active_servers" '.activeServers = $servers' "$ACTIVE_SERVERS_FILE" > "${ACTIVE_SERVERS_FILE}.tmp"
  mv "${ACTIVE_SERVERS_FILE}.tmp" "$ACTIVE_SERVERS_FILE"
}

get_active_servers() {
  # 初期化処理でエラーが発生してもスクリプトを継続
  if ! init_dev_server_state "$DEV_SERVER_STATE_DIR"; then
    log_warn "状態ディレクトリの初期化で警告が発生しました"
  fi
  
  # リスト更新でエラーが発生してもスクリプトを継続
  if ! update_active_servers_list; then
    log_warn "アクティブサーバーリストの更新で警告が発生しました"
  fi
  
  # ファイル読み込みでエラーが発生した場合は空の配列を返す
  if [[ -f "$ACTIVE_SERVERS_FILE" ]]; then
    local result
    if result=$(jq -r '.activeServers[]?' "$ACTIVE_SERVERS_FILE" 2>/dev/null); then
      echo "$result"
    else
      log_debug "アクティブサーバーファイルの読み込みに失敗、空の配列を返します"
      echo "[]"
    fi
  else
    log_debug "アクティブサーバーファイルが存在しません、空の配列を返します"
    echo "[]"
  fi
  
  # 常に正常終了
  return 0
}

# =============================================================================
# プロセス制御関数
# =============================================================================

stop_process_gracefully() {
  local pid="$1"
  local timeout="${2:-10}"
  
  if ! kill -0 "$pid" 2>/dev/null; then
    log_debug "プロセス $pid は既に停止済み"
    return 0
  fi
  
  log_info "プロセス $pid を停止中..."
  
  # SIGTERM送信
  if kill -TERM "$pid" 2>/dev/null; then
    # 指定時間待機
    for ((i = 0; i < timeout; i++)); do
      if ! kill -0 "$pid" 2>/dev/null; then
        log_info "プロセス $pid を正常停止"
        remove_server_pid "$pid"
        return 0
      fi
      sleep 1
    done
    
    # 強制終了
    log_warn "プロセス $pid を強制停止"
    kill -KILL "$pid" 2>/dev/null || true
    sleep 1
  fi
  
  if ! kill -0 "$pid" 2>/dev/null; then
    remove_server_pid "$pid"
    return 0
  else
    log_error "プロセス $pid の停止に失敗"
    return 1
  fi
}

# =============================================================================
# ユーティリティ関数
# =============================================================================

format_duration() {
  local start_time="$1"
  local current_time="${2:-$(date -Iseconds)}"
  
  local start_seconds
  local current_seconds
  
  start_seconds=$(date -d "$start_time" +%s 2>/dev/null || echo "0")
  current_seconds=$(date -d "$current_time" +%s 2>/dev/null || echo "0")
  
  local duration=$((current_seconds - start_seconds))
  
  if [[ $duration -lt 60 ]]; then
    echo "${duration}秒"
  elif [[ $duration -lt 3600 ]]; then
    echo "$((duration / 60))分"
  else
    echo "$((duration / 3600))時間$((duration % 3600 / 60))分"
  fi
  return 0
}

extract_command_type() {
  local command="$1"
  
  case "$command" in
    *"npm run dev"*|*"npm dev"*)
      echo "npm"
      ;;
    *"pnpm run dev"*|*"pnpm dev"*)
      echo "pnpm"
      ;;
    *"yarn dev"*)
      echo "yarn"
      ;;
    *"next dev"*)
      echo "next"
      ;;
    *"npx next dev"*)
      echo "npx-next"
      ;;
    *)
      echo "unknown"
      ;;
  esac
  return 0
}

# =============================================================================
# 初期化実行
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  # スクリプトが直接実行された場合のテスト
  echo "🔍 開発サーバーユーティリティ - テストモード"
  
  init_dev_server_state "$DEV_SERVER_STATE_DIR"
  echo "✅ 状態管理ディレクトリ初期化完了"
  
  echo "📊 現在のプロセス状況:"
  detect_dev_servers
  
  echo "🔌 使用中ポート:"
  get_used_ports
  
  echo "🏃 アクティブサーバー:"
  get_active_servers
fi