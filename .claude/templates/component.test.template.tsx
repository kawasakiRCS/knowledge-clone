/**
 * {{COMPONENT_NAME}} テスト
 * 
 * @description TDD必須：実装前にこのテストを作成し、Red→Green→Refactorサイクルを実行
 * @see CLAUDE.md - TDD必須ルール
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { {{COMPONENT_NAME}} } from '../{{COMPONENT_NAME}}'

describe('{{COMPONENT_NAME}}', () => {
  describe('基本レンダリング', () => {
    test('コンポーネントが正常に表示される', () => {
      render(<{{COMPONENT_NAME}} />)
      
      // TODO: 適切なアクセシビリティロールまたはテストIDで要素を取得
      // expect(screen.getByRole('...')).toBeInTheDocument()
      // expect(screen.getByTestId('...')).toBeInTheDocument()
    })

    test('必要なプロパティで正しくレンダリングされる', () => {
      const props = {
        // TODO: コンポーネントに必要なプロパティを定義
      }
      
      render(<{{COMPONENT_NAME}} {...props} />)
      
      // TODO: プロパティが正しく反映されているかテスト
    })
  })

  describe('ユーザー操作', () => {
    test('ユーザーインタラクションが正常に動作する', async () => {
      const user = userEvent.setup()
      render(<{{COMPONENT_NAME}} />)
      
      // TODO: ユーザー操作をテスト
      // await user.click(screen.getByRole('button'))
      // await user.type(screen.getByRole('textbox'), 'test input')
      
      // TODO: 操作後の状態をアサート
    })
  })

  describe('Edge Cases', () => {
    test('エラー状態を適切に処理する', () => {
      // TODO: エラーケースのテスト
    })

    test('空のデータを適切に表示する', () => {
      // TODO: 空データケースのテスト
    })
  })

  describe('アクセシビリティ', () => {
    test('適切なアクセシビリティ属性が設定されている', () => {
      render(<{{COMPONENT_NAME}} />)
      
      // TODO: アクセシビリティのテスト
      // expect(screen.getByRole('...')).toHaveAccessibleName()
      // expect(screen.getByRole('...')).toHaveAttribute('aria-label')
    })
  })

  describe('旧システム互換性', () => {
    test('CSSクラス構造が旧システムと同等', () => {
      render(<{{COMPONENT_NAME}} />)
      
      // TODO: 旧システムと同じCSSクラスが適用されているかテスト
      // expect(screen.getByRole('...')).toHaveClass('expected-legacy-class')
    })

    test('データ構造が旧システムと互換性がある', () => {
      // TODO: データ構造の互換性テスト
    })
  })
})

/**
 * TDD チェックリスト
 * 
 * 🔴 Red: 失敗するテストを書く
 * - [ ] コンポーネントが存在しない状態でテストを実行
 * - [ ] テストが期待通り失敗することを確認
 * 
 * 🟢 Green: テストを通す最小実装
 * - [ ] テストを通すための最小限のコンポーネントを実装
 * - [ ] すべてのテストが通ることを確認
 * 
 * 🔵 Refactor: 実装を改善
 * - [ ] コードの品質を向上させる
 * - [ ] テストが引き続き通ることを確認
 * - [ ] カバレッジ80%以上を維持
 */