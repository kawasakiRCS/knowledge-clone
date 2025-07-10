# 🏗️ CLAUDE.md - Claude Code Global Configuration

This file provides guidance to Claude Code (claude.ai/code) when working across all projects.

## 📋 Overview

This is my global Claude Code configuration directory (`~/.claude`) that sets up:
- Professional development standards and workflows
- Language-specific best practices (Rust, Go, TypeScript, Python, Bash)
- Permission rules for tool usage
- Environment variables for development
- Session history and todo management

## 🧠 Proactive AI Assistance

### 🔴 YOU MUST: Test-Driven Development (TDD) - 最優先ルール
**すべての実装はテスト駆動開発で行う。実装コードを書く前に必ずテストを先に書く。**

#### TDD必須手順
1. **Red**: 失敗するテストを先に書く
2. **Green**: テストを通すために最小限の実装を行う  
3. **Refactor**: 実装とテストを改善する

#### TDDが見逃される原因と対策
❌ **見逃された原因（Issue #28での反省）**
- ✗ 実装を急いでテストを後回しにした
- ✗ 「動くものを先に作る」という思考パターン
- ✗ テスト環境の未整備
- ✗ プランニング段階でテスト作成が含まれていなかった

✅ **改善策**
- ✅ **必須チェックリスト**: TodoWrite で「テスト作成」を実装前の最優先タスクにする
- ✅ **ルール強化**: 実装コード1行書く前に、対応するテストファイルが存在することを確認
- ✅ **テンプレート化**: 新コンポーネント作成時は自動的に`__tests__/ComponentName.test.tsx`も作成
- ✅ **品質ゲート**: `npm test`が通らない場合はコミット禁止

#### TDD強制フロー
```
新機能実装・バグ修正 → 
  ↓
1. テストファイル作成（*.test.tsx）→
  ↓  
2. 失敗するテスト記述 →
  ↓
3. npm test実行（Red確認）→
  ↓
4. 最小実装でテスト通過（Green）→
  ↓
5. リファクタリング →
  ↓
6. 最終テスト実行（全Green確認）→
  ↓
7. コミット許可
```

### YOU MUST: Always Suggest Improvements
**Every interaction should include proactive suggestions to save engineer time**

1. **Pattern Recognition**
   - Identify repeated code patterns and suggest abstractions
   - Detect potential performance bottlenecks before they matter
   - Recognize missing error handling and suggest additions
   - Spot opportunities for parallelization or caching

2. **Code Quality Improvements**
   - Suggest more idiomatic approaches for the language
   - Recommend better library choices based on project needs
   - Propose architectural improvements when patterns emerge
   - Identify technical debt and suggest refactoring plans

3. **Time-Saving Automations**
   - Create scripts for repetitive tasks observed
   - Generate boilerplate code with full documentation
   - Set up GitHub Actions for common workflows
   - Build custom CLI tools for project-specific needs

4. **Documentation Generation**
   - Auto-generate comprehensive documentation (rustdoc, JSDoc, godoc, docstrings)
   - Create API documentation from code
   - Generate README sections automatically
   - Maintain architecture decision records (ADRs)

### Proactive Suggestion Format
```
💡 **Improvement Suggestion**: [Brief title]
**Time saved**: ~X minutes per occurrence
**Implementation**: [Quick command or code snippet]
**Benefits**: [Why this improves the codebase]
```

## 🎯 Development Philosophy

### Core Principles
- **Engineer time is precious** - Automate everything possible
- **Quality without bureaucracy** - Smart defaults over process
- **Proactive assistance** - Suggest improvements before asked
- **Self-documenting code** - Generate docs automatically
- **Continuous improvement** - Learn from patterns and optimize

## 📚 AI Assistant Guidelines

### Efficient Professional Workflow
**Smart Explore-Plan-Code-Commit with time-saving automation**

#### 1. EXPLORE Phase (Automated)
- **Use AI to quickly scan and summarize codebase**
- **Auto-identify dependencies and impact areas**
- **Generate dependency graphs automatically**
- **Present findings concisely with actionable insights**

#### 2. PLAN Phase (AI-Assisted)
- **Generate multiple implementation approaches**
- **Auto-create test scenarios from requirements**
- **Predict potential issues using pattern analysis**
- **Provide time estimates for each approach**

#### 3. CODE Phase (Accelerated)
- **Generate boilerplate with full documentation**
- **Auto-complete repetitive patterns**
- **Real-time error detection and fixes**
- **Parallel implementation of independent components**
- **Auto-generate comprehensive comments explaining complex logic**

#### 4. COMMIT Phase (Automated)
```bash
# Language-specific quality checks
cargo fmt && cargo clippy && cargo test  # Rust
go fmt ./... && golangci-lint run && go test ./...  # Go
npm run precommit  # TypeScript
uv run --frozen ruff format . && uv run --frozen ruff check . && uv run --frozen pytest  # Python
```

### Documentation & Code Quality Requirements
- **YOU MUST: Generate comprehensive documentation for every function**
- **YOU MUST: Add clear comments explaining business logic**
- **YOU MUST: Create examples in documentation**
- **YOU MUST: Auto-fix all linting/formatting issues**
- **YOU MUST: Generate unit tests for new code**


## 📘 TypeScript Development

### Core Rules
- **Package Manager**: Use `pnpm` > `npm` > `yarn`
- **Type Safety**: `strict: true` in tsconfig.json
- **Null Handling**: Use optional chaining `?.` and nullish coalescing `??`
- **Imports**: Use ES modules, avoid require()

### Code Quality Tools
```bash
# Format code
npx prettier --write .

# Lint code
npx eslint . --fix

# Type check
npx tsc --noEmit

# Run tests
npm test -- --coverage

# Bundle analysis
npx webpack-bundle-analyzer
```

### Documentation Template (TypeScript)
```typescript
/**
 * Brief description of what the function does
 * 
 * @description Detailed explanation of the business logic and purpose
 * @param paramName - What this parameter represents
 * @returns What the function returns and why
 * @throws {ErrorType} When this error occurs
 * @example
 * ```typescript
 * // Example usage
 * const result = functionName({ key: 'value' });
 * console.log(result); // Expected output
 * ```
 * @see {@link RelatedFunction} For related functionality
 * @since 1.0.0
 */
export function functionName(paramName: ParamType): ReturnType {
  // Implementation
}
```

### Best Practices
- **Type Inference**: Let TypeScript infer when obvious
- **Generics**: Use for reusable components
- **Union Types**: Prefer over enums for string literals
- **Utility Types**: Use built-in types (Partial, Pick, Omit)

### Testing Standards
- **Framework**: Jest + React Testing Library + TypeScript
- **Test Location**: `__tests__/ComponentName.test.tsx` (コンポーネントと同階層)
- **Coverage**: 最低80%、重要コンポーネントは90%以上
- **Test Types**: Unit + Integration + E2E (必要に応じて)

#### Testing Setup Commands
```bash
# テスト環境セットアップ
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest

# テスト実行
npm test              # 全テスト実行
npm run test:watch    # ファイル変更監視
npm run test:coverage # カバレッジ付き実行
```

#### Test File Template
```typescript
/**
 * コンポーネント名テスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  describe('基本レンダリング', () => {
    test('コンポーネントが表示される', () => {
      render(<ComponentName />);
      expect(screen.getByRole('...')).toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('クリック時の動作', async () => {
      const user = userEvent.setup();
      render(<ComponentName />);
      
      await user.click(screen.getByRole('button'));
      
      expect(...).toBe(...);
    });
  });

  describe('旧システム互換性', () => {
    test('CSSクラス構造が同等', () => {
      render(<ComponentName />);
      expect(screen.getByRole('...')).toHaveClass('expected-class');
    });
  });
});
```

## 🐍 Python Development

### Core Rules
- **Package Manager**: ONLY use `uv`, NEVER `pip`
- **Type Hints**: Required for all functions
- **Async**: Use `anyio` for testing, not `asyncio`
- **Line Length**: 88 characters maximum

### Code Quality Tools
```bash
# Format code
uv run --frozen ruff format .

# Lint code
uv run --frozen ruff check . --fix

# Type check
uv run --frozen pyright

# Run tests
uv run --frozen pytest --cov

# Security check
uv run --frozen bandit -r .
```

### Documentation Template (Python)
```python
def function_name(param: ParamType) -> ReturnType:
    """Brief description of the function.
    
    Detailed explanation of what the function does and why.
    
    Args:
        param: Description of the parameter and its purpose.
        
    Returns:
        Description of what is returned and its structure.
        
    Raises:
        ErrorType: When this specific error condition occurs.
        
    Example:
        >>> result = function_name("input")
        >>> print(result)
        'expected output'
        
    Note:
        Any important notes about usage or limitations.
    """
    # Implementation
```

### Best Practices
- **Virtual Environments**: Always use venv or uv
- **Dependencies**: Pin versions in requirements
- **Testing**: Use pytest with fixtures
- **Type Narrowing**: Explicit None checks for Optional

## 🐚 Bash Development

### Core Rules
- **Shebang**: Always `#!/usr/bin/env bash`
- **Set Options**: Use `set -euo pipefail`
- **Quoting**: Always quote variables `"${var}"`
- **Functions**: Use local variables

### Best Practices
```bash
#!/usr/bin/env bash
set -euo pipefail

# Global variables in UPPERCASE
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

# Function documentation
# Usage: function_name <arg1> <arg2>
# Description: What this function does
# Returns: 0 on success, 1 on error
function_name() {
    local arg1="${1:?Error: arg1 required}"
    local arg2="${2:-default}"
    
    # Implementation
}

# Error handling
trap 'echo "Error on line $LINENO"' ERR
```

## 🚫 Security and Quality Standards

### NEVER Rules (Non-negotiable)
- **NEVER: Delete production data without explicit confirmation**
- **NEVER: Hardcode API keys, passwords, or secrets**
- **NEVER: Commit code with failing tests or linting errors**
- **NEVER: Push directly to main/master branch**
- **NEVER: Skip security reviews for authentication/authorization code**
- **NEVER: Use `.unwrap()` in production Rust code**
- **NEVER: Ignore error returns in Go**
- **NEVER: Use `any` type in TypeScript production code**
- **NEVER: Use `pip install` - always use `uv`**

### YOU MUST Rules (Required Standards)
- **YOU MUST: Write tests for new features and bug fixes**
- **YOU MUST: Run CI/CD checks before marking tasks complete**
- **YOU MUST: Follow semantic versioning for releases**
- **YOU MUST: Document breaking changes**
- **YOU MUST: Use feature branches for all development**
- **YOU MUST: Add comprehensive documentation to all public APIs**

## 🌳 Git Worktree Workflow

### Why Git Worktree?
Git worktree allows working on multiple branches simultaneously without stashing or switching contexts. Each worktree is an independent working directory with its own branch.

### Setting Up Worktrees
```bash
# Create worktree for feature development
git worktree add ../project-feature-auth feature/user-authentication

# Create worktree for bug fixes
git worktree add ../project-bugfix-api hotfix/api-validation

# Create worktree for experiments
git worktree add ../project-experiment-new-ui experiment/react-19-upgrade
```

### Worktree Naming Convention
```
../project-<type>-<description>
```
Types: feature, bugfix, hotfix, experiment, refactor

### Managing Worktrees
```bash
# List all worktrees
git worktree list

# Remove worktree after merging
git worktree remove ../project-feature-auth

# Prune stale worktree information
git worktree prune
```


## 🤖 AI-Powered Code Review

### Continuous Analysis
**AI should continuously analyze code and suggest improvements**

```
🔍 Code Analysis Results:
- Performance: Found 3 optimization opportunities
- Security: No issues detected
- Maintainability: Suggest extracting 2 methods
- Test Coverage: 85% → Suggest 3 additional test cases
- Documentation: 2 functions missing proper docs
```

## 📊 Efficiency Metrics & Tracking

### Time Savings Report
**Generate weekly efficiency reports**

```
📈 This Week's Productivity Gains:
- Boilerplate generated: 2,450 lines (saved ~3 hours)
- Tests auto-generated: 48 test cases (saved ~2 hours)
- Documentation created: 156 functions (saved ~4 hours)
- Bugs prevented: 12 potential issues caught
- Refactoring automated: 8 patterns extracted
Total time saved: ~11 hours
```

## 🔧 Commit Standards

### Conventional Commits
```bash
# Format: <type>(<scope>): <subject>
git commit -m "feat(auth): add JWT token refresh"
git commit -m "fix(api): handle null response correctly"
git commit -m "docs(readme): update installation steps"
git commit -m "perf(db): optimize query performance"
git commit -m "refactor(core): extract validation logic"
```

### Commit Trailers
```bash
# For bug fixes based on user reports
git commit --trailer "Reported-by: John Doe"

# For GitHub issues
git commit --trailer "Github-Issue: #123"
```

## hooks設定
- `.claude/settings.json`: チャットログ記録設定
- `.claude/logs/`: 日付別のチャットログ保存場所
- `.claude/log-chat.sh`: ログ記録用スクリプト


### PR Guidelines
- Focus on high-level problem and solution
- Never mention tools used (no co-authored-by)
- Add specific reviewers as configured
- Include performance impact if relevant

---

Remember: **Engineer time is gold** - Automate everything, document comprehensively, and proactively suggest improvements. Every interaction should save time and improve code quality.

---

## 🚀 Java to Next.js移植プロジェクト

### プロジェクト概要
当リポジトリは以下の構成で移植作業を実施中：
- **旧システム**: Javaナレッジベースシステム（ルートディレクトリ）
- **新システム**: Next.js + TypeScript（`/nextjs`ディレクトリ） 
- **計画書**: `MIGRATION_ANALYSIS.md`, `MIGRATION_PLAN.md`

### 重要なルール
- **分析レポート優先**: 必ず`MIGRATION_ANALYSIS.md`で全体を把握すること
- **ページ単位移植計画**: **`PAGE_MIGRATION_PLAN.md`を必ず最初に参照**し、110ページの詳細移植計画に従うこと
- **完全移行原則**: 1 Issue = 1 JSPページで、見た目・機能・動作を100%同等にすること
- **Issue連携必須**: すべてのコミットはGitHub Issue番号と紐づけること
- **スクリーンショット比較**: 移植前後の画面比較を必須とすること
- **テスト駆動**: 各ページ実装時にテストを含めること

### 作業開始時の必須確認事項
1. **`PAGE_MIGRATION_PLAN.md`**で具体的な移植対象ページを確認
2. **GitHub Issue**で担当する具体的なJSPページを確認
3. **旧システムファイル**（Controller + JSP + CSS + JS）を詳細確認
4. **移植前スクリーンショット**を取得して比較準備

### 移植時の注意点
- **見た目の同等性**: 既存のCSSクラス・レイアウトを参考にする
- **機能の同等性**: エッジケースも含めて同じ動作を実現する
- **データ互換性**: 既存DBデータとの整合性を保つ
- **段階的実装**: フェーズ計画を守り、完了後に次フェーズに進む

### ファイル管理
- **スキーマ情報**: `knowledge_schema.sql`, `knowledge_tables.txt`, `knowledge_columns.txt`
- **Java旧システム**: ルートディレクトリ（将来`/old_java`へ移動予定）
- **Next.js新システム**: `/nextjs`ディレクトリ（作成予定）
