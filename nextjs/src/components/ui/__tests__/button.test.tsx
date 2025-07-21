/**
 * ボタンコンポーネントテスト
 * 
 * @description Radix UIベースのボタンコンポーネントのテスト
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, buttonVariants } from '../button';

describe('Button', () => {
  describe('基本レンダリング', () => {
    test('ボタンが正しくレンダリングされる', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
    });

    test('childrenが正しく表示される', () => {
      render(<Button>Test Button</Button>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    test('カスタムclassNameが適用される', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('バリアント', () => {
    test('defaultバリアントが適用される', () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    test('destructiveバリアントが適用される', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    test('outlineバリアントが適用される', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-input');
    });

    test('secondaryバリアントが適用される', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });

    test('ghostバリアントが適用される', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    test('linkバリアントが適用される', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });
  });

  describe('サイズ', () => {
    test('defaultサイズが適用される', () => {
      render(<Button size="default">Default Size</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-4', 'py-2');
    });

    test('smサイズが適用される', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8', 'px-3', 'text-xs');
    });

    test('lgサイズが適用される', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-8');
    });

    test('iconサイズが適用される', () => {
      render(<Button size="icon" aria-label="Icon button">🔍</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'w-9');
    });
  });

  describe('インタラクティブ機能', () => {
    test('クリックイベントが発火する', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('disabled状態で無効化される', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    test('disabled状態でクリックできない', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('asChild機能', () => {
    test('asChildがtrueの場合、Slotコンポーネントとしてレンダリングされる', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link', { name: 'Link Button' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    test('asChildの子要素にボタンのスタイルが適用される', () => {
      render(
        <Button asChild variant="outline" size="lg">
          <a href="/test">Styled Link</a>
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('border', 'h-10', 'px-8');
    });
  });

  describe('HTML属性', () => {
    test('type属性が適用される', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    test('aria属性が適用される', () => {
      render(
        <Button aria-label="Close dialog" aria-pressed="true">
          X
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    test('data属性が適用される', () => {
      render(<Button data-testid="test-button">Test</Button>);
      const button = screen.getByTestId('test-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('フォワードRef', () => {
    test('refが正しく転送される', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Ref Button');
    });
  });

  describe('buttonVariants関数', () => {
    test('バリアントとサイズを組み合わせてクラス名を生成', () => {
      const className = buttonVariants({ variant: 'destructive', size: 'sm' });
      expect(className).toContain('bg-destructive');
      expect(className).toContain('h-8');
      expect(className).toContain('text-xs');
    });

    test('カスタムclassNameを追加', () => {
      const className = buttonVariants({ 
        variant: 'ghost', 
        size: 'icon',
        className: 'custom-button' 
      });
      expect(className).toContain('hover:bg-accent');
      expect(className).toContain('h-9 w-9');
      expect(className).toContain('custom-button');
    });

    test('デフォルト値が適用される', () => {
      const className = buttonVariants({});
      expect(className).toContain('bg-primary'); // default variant
      expect(className).toContain('h-9 px-4 py-2'); // default size
    });
  });
});