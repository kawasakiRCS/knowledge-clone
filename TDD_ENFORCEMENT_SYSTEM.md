# 🛡️ TDD強制システム技術仕様書

## 📋 概要

このドキュメントは、CLAUDE.mdで定義されたTDD必須ルールを技術的に強制するhooksシステムの詳細仕様です。

**実装日**: 2025年7月15日  
**目的**: 「実装コード1行書く前に必ずテストが存在する」ことを物理的に強制  
**効果**: .mdファイルでの指示に頼らない真のTDD徹底環境の実現

## 🏗️ システム構成

### 📁 ファイル構成
```
.claude/
├── settings.json              # hooks設定（PreToolUse/PostToolUse）
├── scripts/
│   ├── tdd-setup.sh          # 環境セットアップ・チェック
│   ├── tdd-pre-check.sh      # PreToolUse: 実装前チェック
│   ├── tdd-post-check.sh     # PostToolUse: 実装後検証
│   ├── tdd-cycle-manager.sh  # TDDサイクル管理・統計
│   └── tdd-check-test-required.sh # 独立テストチェック
├── templates/
│   └── component.test.template.tsx # テストテンプレート
└── tdd-state/
    ├── current-phase          # 現在のTDDフェーズ
    ├── cycle-history.json     # TDDサイクル履歴
    └── daily-stats.json       # 日次統計データ

nextjs/
├── jest.config.js            # Jest設定（カバレッジ閾値80%）
└── jest.setup.js             # Jest環境設定

.git/hooks/
└── pre-commit                # Git強制フック（テスト実行必須）
```

## 🔧 強制メカニズム

### 1. PreToolUse Hooks - 実装前チェック

**ファイル**: `.claude/scripts/tdd-pre-check.sh`  
**トリガー**: `Edit`、`MultiEdit`、`Write` ツール実行前  
**機能**: 
- Reactコンポーネントファイル（.tsx/.jsx）の編集前にテストファイル存在確認
- テストファイル不存在時の自動生成（テンプレートベース）
- Red状態確認（テストが適切に失敗することをチェック）

**設定**:
```json
{
  "matcher": "Edit|MultiEdit|Write",
  "hooks": [{
    "type": "command",
    "command": "bash -c 'if [ -f .claude/scripts/tdd-pre-check.sh ]; then .claude/scripts/tdd-pre-check.sh \"$TOOL_INPUT\"; fi'"
  }]
}
```

**チェック対象**:
- `nextjs/components/**/*.tsx`
- `nextjs/app/**/*.tsx`
- `nextjs/lib/**/*.ts`（オプション）

### 2. PostToolUse Hooks - 実装後検証

**ファイル**: `.claude/scripts/tdd-post-check.sh`  
**トリガー**: `Edit`、`MultiEdit`、`Write` ツール実行後  
**機能**:
- 関連テストファイルの自動実行
- TDDサイクル状況表示（Red→Green→Refactor）
- カバレッジチェック（警告表示）

**自動テスト実行パターン**:
```bash
# 実装ファイル → テストファイル自動検索
components/Button.tsx → components/__tests__/Button.test.tsx
app/login/page.tsx → app/login/__tests__/page.test.tsx
```

### 3. Git Pre-commit Hooks - コミット前強制

**ファイル**: `.git/hooks/pre-commit`  
**トリガー**: `git commit` 実行前  
**機能**:
- Next.jsファイル変更検出時の全テスト実行
- テスト失敗時のコミット物理拒否
- カバレッジ80%未満の警告表示

**実行コマンド**:
```bash
cd nextjs && npm test -- --passWithNoTests --silent --watchAll=false
```

## 🎯 TDDサイクル管理

### サイクル追跡

**ファイル**: `.claude/scripts/tdd-cycle-manager.sh`  
**機能**: Red→Green→Refactorサイクルの完全追跡

**コマンド**:
```bash
# フェーズ設定
./tdd-cycle-manager.sh red "新機能のテスト作成"
./tdd-cycle-manager.sh green "実装完了"
./tdd-cycle-manager.sh refactor "コード改善"

# 状況確認
./tdd-cycle-manager.sh status

# レポート生成
./tdd-cycle-manager.sh report 7  # 過去7日間
```

### 統計データ

**JSON形式履歴**:
```json
[
  {
    "timestamp": "2025-07-15T01:32:05Z",
    "phase": "RED",
    "description": "ユーザー認証テスト作成",
    "emoji": "🔴"
  }
]
```

**品質指標**:
- **完了サイクル数**: Red→Green完了回数
- **TDD品質スコア**: 完了サイクル/総アクション × 100%
- **日次統計**: フェーズ別実行回数

## ⚙️ 環境変数

### 制御用変数

| 変数名 | デフォルト | 説明 |
|--------|-----------|------|
| `TDD_STRICT_MODE` | `true` | TDD厳格モードON/OFF |
| `TDD_BYPASS` | `unset` | 緊急時の一時回避（`1`で有効）|
| `TDD_AUTO_CREATE_TEST` | `true` | 自動テストファイル生成 |
| `TDD_CHECK_RED` | `true` | Red状態確認実行 |
| `TDD_VERBOSE_ERRORS` | `true` | 詳細エラー情報表示 |
| `TDD_CHECK_COVERAGE` | `false` | PostHookでのカバレッジチェック |
| `TDD_RUN_ALL_TESTS` | `false` | 全体テスト実行 |

### 使用例

```bash
# TDD厳格モード無効化
export TDD_STRICT_MODE=false

# 緊急時の一時回避（本番禁止）
TDD_BYPASS=1 git commit -m "緊急修正"

# カバレッジチェック有効
export TDD_CHECK_COVERAGE=true
```

## 🧪 Jest設定

### カバレッジ閾値（強制）

**ファイル**: `nextjs/jest.config.js`

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### テストファイルパターン

```javascript
testMatch: [
  '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
  '<rootDir>/app/**/__tests__/**/*.{js,jsx,ts,tsx}',
  '<rootDir>/components/**/__tests__/**/*.{js,jsx,ts,tsx}',
  '<rootDir>/**/*.{spec,test}.{js,jsx,ts,tsx}'
]
```

## 📝 テストテンプレート

### Reactコンポーネント用

**ファイル**: `.claude/templates/component.test.template.tsx`

**特徴**:
- TDDチェックリスト付き
- 基本レンダリング・ユーザー操作・エッジケース・アクセシビリティテスト
- 旧システム互換性テスト項目
- {{COMPONENT_NAME}}変数による自動置換

**自動生成時の置換**:
```bash
# テンプレート内
{{COMPONENT_NAME}} → Button

# 生成されるファイル
components/__tests__/Button.test.tsx
```

## 🚀 運用ガイド

### 初期セットアップ

```bash
# 環境チェック
./.claude/scripts/tdd-setup.sh --check

# システムインストール（必要時）
./.claude/scripts/tdd-setup.sh --install

# 動作テスト
./.claude/scripts/tdd-setup.sh --test
```

### 日常開発フロー

1. **新機能開発開始**
   ```bash
   ./.claude/scripts/tdd-cycle-manager.sh red "ユーザー登録機能"
   ```

2. **コンポーネント作成**
   - Claude Codeで`Write`/`Edit`実行
   - 自動的にPreHookが実行される
   - テストファイル不存在時は自動生成される

3. **実装完了**
   ```bash
   ./.claude/scripts/tdd-cycle-manager.sh green "実装完了"
   ```

4. **リファクタリング**
   ```bash
   ./.claude/scripts/tdd-cycle-manager.sh refactor "コード改善"
   ```

5. **コミット**
   - `git commit`実行
   - 自動的にテスト実行される
   - 成功時のみコミット許可

### トラブルシューティング

#### テスト失敗時

```bash
# 詳細確認
cd nextjs && npm test

# 個別テスト実行
npm test -- --testPathPattern="Button.test.tsx"

# カバレッジ確認
npm test -- --coverage
```

#### hooks無効化（デバッグ用）

```bash
# 一時的な無効化
export TDD_STRICT_MODE=false

# 緊急回避（本番禁止）
TDD_BYPASS=1 git commit -m "緊急修正"
```

## 📊 監視・レポート

### 日次レポート例

```
📊 本日の TDD統計 (2025-07-15):
  🔴 Red フェーズ: 3回
  🟢 Green フェーズ: 3回  
  🔵 Refactor フェーズ: 2回
  🏆 完了サイクル: 3回
  ⭐ TDD品質スコア: 75%
```

### 週次レポート

```bash
./.claude/scripts/tdd-cycle-manager.sh report 7
```

## 🔒 セキュリティ考慮事項

### 本番環境での注意

- `TDD_BYPASS=1`は絶対に使用禁止
- CI/CDパイプラインでもhooksが動作することを確認
- カバレッジ閾値の緩和は慎重に検討

### 監査ログ

- すべてのTDDサイクルが`.claude/tdd-state/cycle-history.json`に記録
- Git hooksの実行ログも記録される
- 違反行為の検出が可能

## 🚧 今後の拡張予定

- **IDE統合**: VS Code拡張でのリアルタイム表示
- **チーム統計**: 複数開発者の統合レポート  
- **AI分析**: TDDパターンの自動分析・改善提案
- **メトリクス収集**: テスト品質指標の自動収集

---

**更新履歴**:
- 2025-07-15: 初版作成・基本システム実装完了