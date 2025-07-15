# 🧪 TDD強制システム クイックガイド

## 🎯 概要

このプロジェクトには**TDD強制hooksシステム**が実装されており、「実装コード1行書く前に必ずテストが存在する」ことを技術的に強制します。

## ⚡ クイックスタート

### 環境チェック
```bash
./.claude/scripts/tdd-setup.sh --check
```

### TDDサイクル開始
```bash
# 新機能開発開始
./.claude/scripts/tdd-cycle-manager.sh red "ユーザー認証機能"

# 現在の状況確認
./.claude/scripts/tdd-cycle-manager.sh status
```

## 🛡️ 強制機能

### ✅ 自動実行される機能

1. **Edit/Write前**: テストファイル存在チェック → 不存在時は自動生成
2. **Edit/Write後**: 関連テスト自動実行 → 結果表示
3. **Git commit前**: 全テスト実行 → 失敗時はコミット拒否

### 🔄 TDDサイクル管理

```bash
# Red: 失敗するテスト作成
./.claude/scripts/tdd-cycle-manager.sh red "新機能テスト"

# Green: テストを通す実装
./.claude/scripts/tdd-cycle-manager.sh green "実装完了"

# Refactor: コード改善
./.claude/scripts/tdd-cycle-manager.sh refactor "リファクタリング"
```

## 🚨 緊急時

### テスト失敗時
```bash
# 詳細確認
cd nextjs && npm test

# 個別テスト実行
npm test -- --testPathPattern="Button.test.tsx"
```

### 緊急回避（本番禁止）
```bash
TDD_BYPASS=1 git commit -m "緊急修正"
```

## 📊 レポート

### 日次統計
```bash
./.claude/scripts/tdd-cycle-manager.sh status
```

### 週次レポート
```bash
./.claude/scripts/tdd-cycle-manager.sh report 7
```

## 🔧 トラブルシューティング

### hooksが動作しない
1. 実行権限確認: `ls -la .claude/scripts/tdd-*.sh`
2. 設定確認: `cat .claude/settings.json`
3. 環境チェック: `./.claude/scripts/tdd-setup.sh --check`

### TDD無効化（デバッグ用）
```bash
export TDD_STRICT_MODE=false
```

## 📚 詳細ドキュメント

- **技術仕様**: `TDD_ENFORCEMENT_SYSTEM.md`
- **設定詳細**: `CLAUDE.md` のTDD強制システム項目
- **進捗記録**: `PROGRESS.md` のTDD強制システム実装記録

---

**重要**: このシステムはプロジェクトの品質向上のため、TDDを技術的に強制します。緊急回避機能は本番環境では絶対に使用しないでください。