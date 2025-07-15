# 開発サーバー状態管理ディレクトリ

このディレクトリは Claude Code 開発サーバー管理システムの状態情報を保存します。

## ファイル構成

### `active-servers.json`
現在アクティブな開発サーバーの一覧を管理します。

```json
{
  "activeServers": [
    {
      "pid": 12345,
      "port": 3000,
      "projectPath": "/workspace/project",
      "sessionId": "user-12345",
      "startTime": "2025-07-15T10:30:00Z"
    }
  ],
  "lastUpdated": "2025-07-15T10:30:00Z",
  "version": "1.0.0"
}
```

### `ports.json`
ポート使用履歴と設定を管理します。

```json
{
  "portHistory": [
    {
      "port": 3000,
      "pid": 12345,
      "timestamp": "2025-07-15T10:30:00Z",
      "projectPath": "/workspace/project"
    }
  ],
  "defaultPorts": [3000, 3001, 3002, 3003, 3004, 3005],
  "lastUpdated": "2025-07-15T10:30:00Z",
  "version": "1.0.0"
}
```

### `config.json`
システム設定を管理します。

```json
{
  "autoStop": false,
  "autoCleanup": false,
  "cleanupTimeout": 10,
  "logLevel": 2,
  "monitoredPorts": [3000, 3001, 3002, 3003, 3004, 3005],
  "excludePatterns": ["grep", "dev-server"],
  "systemSettings": {
    "enableHooks": true,
    "sessionTracking": true,
    "processMonitoring": true
  },
  "lastUpdated": "2025-07-15T10:30:00Z",
  "version": "1.0.0"
}
```

### `pids/` ディレクトリ
個別のプロセス情報を PID 単位で保存します。

ファイル名: `{PID}.pid`

```json
{
  "pid": 12345,
  "port": 3000,
  "projectPath": "/workspace/project",
  "sessionId": "user-12345",
  "startTime": "2025-07-15T10:30:00Z",
  "commandLine": "npm run dev",
  "workingDirectory": "/workspace/project"
}
```

## 環境変数との連携

システムは以下の環境変数を参照し、設定ファイルと組み合わせて動作します：

- `DEV_SERVER_AUTO_STOP`: 自動停止機能
- `DEV_SERVER_AUTO_CLEANUP`: 自動クリーンアップ機能  
- `DEV_SERVER_CLEANUP_TIMEOUT`: 停止タイムアウト
- `DEV_SERVER_LOG_LEVEL`: ログレベル (0-3)

## 手動操作

### 状態リセット
```bash
# 全状態をクリア
rm -rf .claude/dev-server-state/pids/*
echo '{"activeServers": []}' > .claude/dev-server-state/active-servers.json
```

### 設定確認
```bash
# 現在の設定を表示
.claude/scripts/dev-server-manager.sh config
```

### 状況確認
```bash
# 現在の状況を表示
.claude/scripts/dev-server-manager.sh status
```

## 注意事項

- このディレクトリの内容は自動的に管理されます
- 手動で編集する場合は JSON 形式を維持してください  
- プロセスが異常終了した場合、古い PID ファイルが残る可能性があります
- 定期的に `cleanup-orphaned` コマンドを実行することを推奨します

## トラブルシューティング

### 状態が不整合になった場合
```bash
.claude/scripts/dev-server-cleanup.sh cleanup-state
```

### 孤立プロセスを検出する場合  
```bash
.claude/scripts/dev-server-cleanup.sh cleanup-orphaned
```

### システムテスト実行
```bash
.claude/scripts/dev-server-manager.sh test
```