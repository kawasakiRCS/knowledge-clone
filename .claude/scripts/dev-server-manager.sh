#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# 開発サーバー管理メインスクリプト
# 
# @description 開発サーバー管理システムの統合フロントエンド
# @usage dev-server-manager.sh [command] [options]
# @version 1.0.0
# =============================================================================

# 共通ユーティリティの読み込み
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=dev-server-utils.sh
source "${SCRIPT_DIR}/dev-server-utils.sh"

# バージョン情報
readonly VERSION="1.0.0"
readonly SYSTEM_NAME="Claude Code 開発サーバー管理システム"

# =============================================================================
# ヘルプ・使用方法
# =============================================================================

show_main_usage() {
  cat << EOF
$SYSTEM_NAME v$VERSION

🚀 開発サーバーの起動・停止・監視を自動化します

使用方法:
  $0 [command] [options]

主要コマンド:
  start [command]      開発サーバーを安全に起動
  stop [pid]           指定サーバーを停止
  stop-all             全サーバーを停止
  restart [pid]        サーバーを再起動
  status               現在の状況を表示
  
管理コマンド:
  cleanup              孤立プロセスをクリーンアップ
  monitor              リアルタイム監視モード
  config               設定管理
  logs                 ログ表示
  
システムコマンド:
  install              hooks システムにインストール
  uninstall            hooks システムから削除
  test                 システムテスト実行
  help                 詳細ヘルプ

対話モード:
  $0                   対話モードで起動

グローバルオプション:
  --force              確認なしで実行
  --quiet              静音モード  
  --debug              デバッグモード
  --timeout <seconds>  タイムアウト設定

設定例:
  # 自動停止を有効化
  export DEV_SERVER_AUTO_STOP=true
  
  # 自動クリーンアップを有効化
  export DEV_SERVER_AUTO_CLEANUP=true
  
  # タイムアウト設定
  export DEV_SERVER_CLEANUP_TIMEOUT=15

使用例:
  $0 start "npm run dev"         # 安全にnpm run devを起動
  $0 stop 12345                  # PID 12345を停止
  $0 stop-all --force            # 全サーバーを強制停止
  $0 status                      # 現在の状況確認
  $0 cleanup                     # 孤立プロセス削除

詳細ドキュメント:
  https://github.com/your-org/claude-code-extensions

EOF
}

show_detailed_help() {
  cat << EOF
$SYSTEM_NAME - 詳細ヘルプ

═══════════════════════════════════════════════════════════════

🎯 概要
  npm run dev などの開発サーバーを自動的に管理し、プロセスの重複や
  ポート競合を防ぎます。Claude Code の hooks システムと連携して
  シームレスな開発体験を提供します。

🔧 セットアップ
  1. システムインストール
     $0 install
  
  2. 環境変数設定 (オプション)
     export DEV_SERVER_AUTO_STOP=true
     export DEV_SERVER_AUTO_CLEANUP=true
  
  3. 動作確認
     $0 test

📋 主要機能

  ✅ プロセス重複検出
     新しい開発サーバー起動前に既存プロセスを自動検出し、
     停止・別ポート起動・キャンセルの選択肢を提供

  ✅ ポート競合回避  
     3000-3005番ポートの使用状況を監視し、利用可能な
     ポートを自動提案

  ✅ セッション管理
     Claude Code セッション終了時に残存プロセスを自動検出し、
     クリーンアップを実行

  ✅ 状態追跡
     起動した全ての開発サーバーのPID、ポート、実行時間を
     JSON形式で記録・管理

🎮 対話モード詳細

  対話モードでは以下の操作が可能です:
  
  1) 現在の状況表示
  2) サーバー起動
  3) サーバー停止
  4) 設定変更
  5) ログ表示
  6) システムテスト
  
  $0 を引数なしで実行すると対話モードが起動します。

⚙️  設定システム

  環境変数:
    DEV_SERVER_AUTO_STOP=true          # 自動停止有効
    DEV_SERVER_AUTO_CLEANUP=true       # 自動クリーンアップ有効
    DEV_SERVER_CLEANUP_TIMEOUT=10      # 停止タイムアウト(秒)
    DEV_SERVER_LOG_LEVEL=2             # ログレベル(0-3)
  
  設定ファイル:
    .claude/dev-server-state/config.json

🔍 トラブルシューティング

  問題: サーバーが起動しない
  解決: $0 cleanup で孤立プロセスを削除

  問題: ポート競合エラー
  解決: $0 status でポート使用状況を確認

  問題: セッション終了後もプロセスが残る
  解決: export DEV_SERVER_AUTO_CLEANUP=true を設定

  問題: hooks が動作しない
  解決: $0 install でhooks を再インストール

📊 ログとデバッグ

  デバッグモード:
    $0 --debug [command]

  ログ表示:
    $0 logs [--tail] [--grep pattern]

  状態ファイル:
    .claude/dev-server-state/active-servers.json
    .claude/dev-server-state/pids/*.pid

🤝 統合システム

  本システムは以下のスクリプトで構成されています:
  
  dev-server-utils.sh      # 共通ユーティリティ
  dev-server-monitor.sh    # プロセス監視 (hooks用)
  dev-server-cleanup.sh    # クリーンアップ機能
  dev-server-manager.sh    # 統合フロントエンド (このスクリプト)

EOF
}

# =============================================================================
# 対話モード
# =============================================================================

interactive_mode() {
  echo "🎮 $SYSTEM_NAME - 対話モード"
  echo "================================"
  echo ""
  
  while true; do
    echo "選択してください:"
    echo "1) 現在の状況表示"
    echo "2) サーバー起動"
    echo "3) サーバー停止"
    echo "4) 全サーバー停止"
    echo "5) クリーンアップ実行"
    echo "6) 設定確認"
    echo "7) ログ表示"
    echo "8) システムテスト"
    echo "9) ヘルプ表示"
    echo "0) 終了"
    echo ""
    
    read -rp "選択 (0-9): " choice
    echo ""
    
    case "$choice" in
      1)
        "${SCRIPT_DIR}/dev-server-cleanup.sh" status
        ;;
      2)
        read -rp "起動コマンドを入力してください (例: npm run dev): " start_command
        if [[ -n "$start_command" ]]; then
          start_server_interactive "$start_command"
        fi
        ;;
      3)
        list_servers_for_stop
        ;;
      4)
        "${SCRIPT_DIR}/dev-server-cleanup.sh" stop-all
        ;;
      5)
        "${SCRIPT_DIR}/dev-server-cleanup.sh" cleanup-orphaned
        ;;
      6)
        show_configuration
        ;;
      7)
        show_logs_interactive
        ;;
      8)
        run_system_test
        ;;
      9)
        show_detailed_help
        ;;
      0)
        echo "👋 終了します"
        break
        ;;
      *)
        echo "❌ 無効な選択です"
        ;;
    esac
    
    echo ""
    read -rp "続行するには Enter を押してください..."
    echo ""
  done
}

start_server_interactive() {
  local command="$1"
  
  echo "🚀 サーバー起動: $command"
  echo ""
  
  # 事前チェック実行
  echo "$command" | "${SCRIPT_DIR}/dev-server-monitor.sh" pre
  
  echo ""
  read -rp "続行しますか? (y/N): " confirm
  
  if [[ "${confirm,,}" == "y" ]]; then
    echo "起動中..."
    eval "$command" &
    local pid=$!
    
    echo "PID: $pid で起動しました"
    
    # 起動後チェック
    sleep 2
    echo "$command" | "${SCRIPT_DIR}/dev-server-monitor.sh" post
  else
    echo "キャンセルしました"
  fi
}

list_servers_for_stop() {
  local active_servers
  active_servers=$(get_active_servers)
  
  if [[ "$active_servers" == "[]" ]] || [[ -z "$active_servers" ]]; then
    echo "ℹ️  停止対象のサーバーはありません"
    return 0
  fi
  
  echo "停止対象のサーバー:"
  local count=0
  local pids=()
  
  while IFS= read -r server_info; do
    [[ -z "$server_info" ]] && continue
    ((count++))
    
    local pid port project_path start_time
    pid=$(echo "$server_info" | jq -r '.pid')
    port=$(echo "$server_info" | jq -r '.port')
    project_path=$(echo "$server_info" | jq -r '.projectPath')
    start_time=$(echo "$server_info" | jq -r '.startTime')
    
    pids+=("$pid")
    
    local duration
    duration=$(format_duration "$start_time")
    
    echo "$count) PID: $pid - ポート: $port - 実行時間: $duration"
    echo "   プロジェクト: $project_path"
  done <<< "$(echo "$active_servers" | jq -c '.[]?' 2>/dev/null || echo "")"
  
  echo ""
  read -rp "停止するサーバー番号を入力 (1-$count, 0=キャンセル): " choice
  
  if [[ "$choice" =~ ^[1-9][0-9]*$ ]] && [[ $choice -le $count ]]; then
    local target_pid="${pids[$((choice-1))]}"
    "${SCRIPT_DIR}/dev-server-cleanup.sh" stop "$target_pid"
  elif [[ "$choice" != "0" ]]; then
    echo "❌ 無効な選択です"
  fi
}

# =============================================================================
# 設定管理
# =============================================================================

show_configuration() {
  echo "⚙️  システム設定"
  echo "===================="
  echo ""
  
  echo "環境変数:"
  echo "  DEV_SERVER_AUTO_STOP: ${DEV_SERVER_AUTO_STOP:-false}"
  echo "  DEV_SERVER_AUTO_CLEANUP: ${DEV_SERVER_AUTO_CLEANUP:-false}"
  echo "  DEV_SERVER_CLEANUP_TIMEOUT: ${DEV_SERVER_CLEANUP_TIMEOUT:-10}"
  echo "  DEV_SERVER_LOG_LEVEL: ${DEV_SERVER_LOG_LEVEL:-2}"
  echo ""
  
  echo "パス設定:"
  echo "  状態ディレクトリ: $DEV_SERVER_STATE_DIR"
  echo "  PIDディレクトリ: $PIDS_DIR"
  echo "  スクリプトディレクトリ: $SCRIPT_DIR"
  echo ""
  
  echo "hooks 設定:"
  local settings_file="${SCRIPT_DIR}/../settings.json"
  if [[ -f "$settings_file" ]]; then
    if jq -e '.hooks.PreToolUse[]? | select(.matcher | test("Bash"))' "$settings_file" >/dev/null 2>&1; then
      echo "  ✅ PreToolUse hooks が設定済み"
    else
      echo "  ❌ PreToolUse hooks が未設定"
    fi
    
    if jq -e '.hooks.PostToolUse[]? | select(.matcher | test("Bash"))' "$settings_file" >/dev/null 2>&1; then
      echo "  ✅ PostToolUse hooks が設定済み"
    else
      echo "  ❌ PostToolUse hooks が未設定"
    fi
    
    if jq -e '.hooks.Stop[]?' "$settings_file" >/dev/null 2>&1; then
      echo "  ✅ Stop hooks が設定済み"
    else
      echo "  ❌ Stop hooks が未設定"
    fi
  else
    echo "  ❌ settings.json が見つかりません"
  fi
}

manage_configuration() {
  echo "設定管理 (実装予定)"
  # TODO: 対話的な設定変更機能
}

# =============================================================================
# ログ表示
# =============================================================================

show_logs_interactive() {
  echo "📋 ログ表示オプション:"
  echo "1) 状態ファイル表示"
  echo "2) アクティブサーバー履歴"
  echo "3) エラーログ検索"
  echo "4) 戻る"
  echo ""
  
  read -rp "選択 (1-4): " log_choice
  
  case "$log_choice" in
    1)
      echo "📄 アクティブサーバー状態:"
      if [[ -f "$ACTIVE_SERVERS_FILE" ]]; then
        jq '.' "$ACTIVE_SERVERS_FILE"
      else
        echo "状態ファイルが見つかりません"
      fi
      ;;
    2)
      echo "📊 PIDファイル一覧:"
      if [[ -d "$PIDS_DIR" ]]; then
        for pid_file in "$PIDS_DIR"/*.pid; do
          [[ -f "$pid_file" ]] || continue
          echo "--- $(basename "$pid_file") ---"
          cat "$pid_file"
          echo ""
        done
      else
        echo "PIDディレクトリが見つかりません"
      fi
      ;;
    3)
      echo "🔍 エラーログ検索 (実装予定)"
      ;;
    4)
      return 0
      ;;
    *)
      echo "❌ 無効な選択です"
      ;;
  esac
}

# =============================================================================
# システム管理
# =============================================================================

install_hooks() {
  local settings_file="${SCRIPT_DIR}/../settings.json"
  
  echo "🔧 hooks システムにインストール中..."
  
  if [[ ! -f "$settings_file" ]]; then
    echo "❌ settings.json が見つかりません: $settings_file"
    return 1
  fi
  
  # バックアップ作成
  cp "$settings_file" "${settings_file}.backup.$(date +%s)"
  
  # hooks 設定を追加
  local temp_file
  temp_file=$(mktemp)
  
  jq --arg script_path "${SCRIPT_DIR}/dev-server-monitor.sh" '
    .hooks.PreToolUse = (.hooks.PreToolUse // []) + [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "bash -c '\''echo \"$TOOL_INPUT\" | " + $script_path + " pre'\''"
      }]
    }] |
    .hooks.PostToolUse = (.hooks.PostToolUse // []) + [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command", 
        "command": "bash -c '\''echo \"$TOOL_INPUT\" | " + $script_path + " post'\''"
      }]
    }] |
    .hooks.Stop = (.hooks.Stop // []) + [{
      "hooks": [{
        "type": "command",
        "command": "bash -c '\''" + $script_path + "/../dev-server-cleanup.sh session-end'\''"
      }]
    }]
  ' "$settings_file" > "$temp_file"
  
  mv "$temp_file" "$settings_file"
  
  echo "✅ hooks インストール完了"
  echo "💡 Claude Code を再起動して設定を反映してください"
}

uninstall_hooks() {
  local settings_file="${SCRIPT_DIR}/../settings.json"
  
  echo "🗑️  hooks システムから削除中..."
  
  if [[ ! -f "$settings_file" ]]; then
    echo "❌ settings.json が見つかりません"
    return 1
  fi
  
  # バックアップ作成
  cp "$settings_file" "${settings_file}.backup.$(date +%s)"
  
  # hooks 設定を削除
  local temp_file
  temp_file=$(mktemp)
  
  jq '
    .hooks.PreToolUse = (.hooks.PreToolUse // []) | map(select(.matcher != "Bash" or (.hooks[0].command | contains("dev-server-monitor") | not))) |
    .hooks.PostToolUse = (.hooks.PostToolUse // []) | map(select(.matcher != "Bash" or (.hooks[0].command | contains("dev-server-monitor") | not))) |
    .hooks.Stop = (.hooks.Stop // []) | map(select(.hooks[0].command | contains("dev-server-cleanup") | not))
  ' "$settings_file" > "$temp_file"
  
  mv "$temp_file" "$settings_file"
  
  echo "✅ hooks 削除完了"
}

run_system_test() {
  echo "🧪 システムテスト実行中..."
  echo ""
  
  local test_count=0
  local pass_count=0
  
  # テスト1: スクリプトファイル存在確認
  ((test_count++))
  echo "テスト $test_count: スクリプトファイル存在確認"
  
  local required_scripts=(
    "dev-server-utils.sh"
    "dev-server-monitor.sh" 
    "dev-server-cleanup.sh"
    "dev-server-manager.sh"
  )
  
  local missing_scripts=()
  for script in "${required_scripts[@]}"; do
    if [[ ! -f "${SCRIPT_DIR}/$script" ]]; then
      missing_scripts+=("$script")
    fi
  done
  
  if [[ ${#missing_scripts[@]} -eq 0 ]]; then
    echo "✅ 全スクリプトファイルが存在します"
    ((pass_count++))
  else
    echo "❌ 不足スクリプト: ${missing_scripts[*]}"
  fi
  
  # テスト2: 実行権限確認
  ((test_count++))
  echo ""
  echo "テスト $test_count: 実行権限確認"
  
  local non_executable=()
  for script in "${required_scripts[@]}"; do
    if [[ ! -x "${SCRIPT_DIR}/$script" ]]; then
      non_executable+=("$script")
    fi
  done
  
  if [[ ${#non_executable[@]} -eq 0 ]]; then
    echo "✅ 全スクリプトに実行権限があります"
    ((pass_count++))
  else
    echo "❌ 実行権限なし: ${non_executable[*]}"
  fi
  
  # テスト3: 共通ユーティリティ読み込み
  ((test_count++))
  echo ""
  echo "テスト $test_count: 共通ユーティリティ読み込み"
  
  if bash -c "source '${SCRIPT_DIR}/dev-server-utils.sh' && echo 'OK'" >/dev/null 2>&1; then
    echo "✅ dev-server-utils.sh の読み込み成功"
    ((pass_count++))
  else
    echo "❌ dev-server-utils.sh の読み込み失敗"
  fi
  
  # テスト4: 状態ディレクトリ作成
  ((test_count++))
  echo ""
  echo "テスト $test_count: 状態ディレクトリ初期化"
  
  if bash -c "source '${SCRIPT_DIR}/dev-server-utils.sh' && init_dev_server_state '$DEV_SERVER_STATE_DIR'" >/dev/null 2>&1; then
    echo "✅ 状態ディレクトリ初期化成功"
    ((pass_count++))
  else
    echo "❌ 状態ディレクトリ初期化失敗"
  fi
  
  # テスト5: JSON処理
  ((test_count++))
  echo ""
  echo "テスト $test_count: JSON処理機能"
  
  if command -v jq >/dev/null 2>&1; then
    echo "✅ jq コマンド利用可能"
    ((pass_count++))
  else
    echo "❌ jq コマンドが見つかりません"
  fi
  
  # 結果表示
  echo ""
  echo "📊 テスト結果: $pass_count/$test_count 件成功"
  
  if [[ $pass_count -eq $test_count ]]; then
    echo "✅ 全テストが成功しました"
    return 0
  else
    echo "❌ 一部のテストが失敗しました"
    return 1
  fi
}

# =============================================================================
# メインコマンド処理
# =============================================================================

handle_start_command() {
  local command="$*"
  
  if [[ -z "$command" ]]; then
    log_error "起動コマンドを指定してください"
    echo "使用例: $0 start \"npm run dev\""
    return 1
  fi
  
  echo "🚀 サーバー起動: $command"
  
  # 事前チェック
  echo "$command" | "${SCRIPT_DIR}/dev-server-monitor.sh" pre
  
  # TODO: 実際の起動処理（現在は手動実行を案内）
  echo ""
  echo "💡 次のコマンドを実行してください:"
  echo "   $command"
  echo ""
  echo "または、対話モードを使用してください:"
  echo "   $0"
}

handle_stop_command() {
  local pid="$1"
  
  if [[ -z "$pid" ]]; then
    log_error "PIDを指定してください"
    echo "使用例: $0 stop 12345"
    return 1
  fi
  
  "${SCRIPT_DIR}/dev-server-cleanup.sh" stop "$pid"
}

handle_restart_command() {
  local pid="$1"
  
  if [[ -z "$pid" ]]; then
    log_error "PIDを指定してください"
    echo "使用例: $0 restart 12345"
    return 1
  fi
  
  echo "🔄 サーバー再起動: PID $pid"
  
  # TODO: 再起動処理の実装
  echo "再起動機能は実装予定です"
}

# =============================================================================
# メイン処理
# =============================================================================

main() {
  local command="${1:-}"
  local force=false
  local quiet=false
  local debug=false
  local timeout="${DEV_SERVER_CLEANUP_TIMEOUT:-10}"
  
  # グローバルオプション解析
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --force)
        force=true
        shift
        ;;
      --quiet)
        quiet=true
        LOG_LEVEL=0
        shift
        ;;
      --debug)
        debug=true
        LOG_LEVEL=3
        shift
        ;;
      --timeout)
        timeout="$2"
        shift 2
        ;;
      --version)
        echo "$SYSTEM_NAME v$VERSION"
        return 0
        ;;
      --)
        shift
        break
        ;;
      -*)
        log_error "無効なオプション: $1"
        return 1
        ;;
      *)
        command="$1"
        shift
        break
        ;;
    esac
  done
  
  # デバッグモード設定
  if [[ "$debug" == "true" ]]; then
    set -x
  fi
  
  # コマンド実行
  case "$command" in
    "")
      interactive_mode
      ;;
    "start")
      handle_start_command "$@"
      ;;
    "stop")
      handle_stop_command "$@"
      ;;
    "stop-all")
      "${SCRIPT_DIR}/dev-server-cleanup.sh" stop-all $([ "$force" = true ] && echo "--force")
      ;;
    "restart")
      handle_restart_command "$@"
      ;;
    "status")
      "${SCRIPT_DIR}/dev-server-cleanup.sh" status
      ;;
    "cleanup")
      "${SCRIPT_DIR}/dev-server-cleanup.sh" cleanup-orphaned $([ "$force" = true ] && echo "--force")
      ;;
    "monitor")
      echo "リアルタイム監視モード (実装予定)"
      ;;
    "config")
      show_configuration
      ;;
    "logs")
      echo "ログ表示機能 (実装予定)"
      ;;
    "install")
      install_hooks
      ;;
    "uninstall")
      uninstall_hooks
      ;;
    "test")
      run_system_test
      ;;
    "help"|"--help")
      show_detailed_help
      ;;
    *)
      log_error "無効なコマンド: $command"
      show_main_usage
      return 1
      ;;
  esac
}

# =============================================================================
# スクリプト実行
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
  exit $?
fi