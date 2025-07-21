/**
 * インプットコンポーネントテスト
 * 
 * @description Radix UIベースのインプットコンポーネントのテスト
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input', () => {
  describe('基本レンダリング', () => {
    test('インプットが正しくレンダリングされる', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    test('デフォルトのクラス名が適用される', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'flex',
        'h-9',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-transparent',
        'px-3',
        'py-1',
        'text-base',
        'shadow-sm',
        'transition-colors'
      );
    });

    test('カスタムclassNameが追加される', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
      // デフォルトクラスも保持される
      expect(input).toHaveClass('flex', 'h-9', 'w-full');
    });
  });

  describe('インプットタイプ', () => {
    test('テキストタイプがデフォルト', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    test('指定したタイプが適用される', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    test('パスワードタイプが適用される', () => {
      render(<Input type="password" placeholder="Password" />);
      const input = screen.getByPlaceholderText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    test('数値タイプが適用される', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('インタラクティブ機能', () => {
    test('ユーザー入力ができる', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'Hello World');
      
      expect(input).toHaveValue('Hello World');
    });

    test('onChangeイベントが発火する', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'Test');
      
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(4); // 'T', 'e', 's', 't'
    });

    test('onFocusイベントが発火する', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    test('onBlurイベントが発火する', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      
      render(
        <>
          <Input onBlur={handleBlur} />
          <button>Other Element</button>
        </>
      );
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      await user.click(input);
      await user.click(button);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('状態管理', () => {
    test('disabled状態で無効化される', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    test('disabled状態で入力できない', async () => {
      const user = userEvent.setup();
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'Test');
      
      expect(input).toHaveValue('');
    });

    test('readOnly状態で読み取り専用になる', async () => {
      const user = userEvent.setup();
      render(<Input readOnly defaultValue="Read Only" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('readOnly');
      expect(input).toHaveValue('Read Only');
      
      await user.type(input, 'New Text');
      
      expect(input).toHaveValue('Read Only');
    });

    test('required属性が適用される', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('HTML属性', () => {
    test('placeholderが表示される', () => {
      render(<Input placeholder="Enter text..." />);
      const input = screen.getByPlaceholderText('Enter text...');
      expect(input).toBeInTheDocument();
    });

    test('name属性が適用される', () => {
      render(<Input name="username" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    test('id属性が適用される', () => {
      render(<Input id="email-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    test('value属性が適用される', () => {
      render(<Input value="Test Value" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Test Value');
    });

    test('defaultValue属性が適用される', () => {
      render(<Input defaultValue="Default Value" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Default Value');
    });

    test('maxLength属性が適用される', async () => {
      const user = userEvent.setup();
      render(<Input maxLength={5} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'This is a long text');
      
      expect(input).toHaveValue('This ');
    });

    test('pattern属性が適用される', () => {
      render(<Input pattern="[0-9]*" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });

    test('autoComplete属性が適用される', () => {
      render(<Input autoComplete="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });

    test('aria属性が適用される', () => {
      render(
        <Input 
          aria-label="Email address" 
          aria-describedby="email-error"
          aria-invalid="true"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Email address');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    test('data属性が適用される', () => {
      render(<Input data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('フォワードRef', () => {
    test('refが正しく転送される', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe('INPUT');
    });

    test('refを通じてフォーカスを設定できる', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      
      ref.current?.focus();
      
      expect(ref.current).toHaveFocus();
    });
  });

  describe('レスポンシブデザイン', () => {
    test('モバイルとデスクトップで異なるテキストサイズ', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      // text-base (モバイル) と md:text-sm (デスクトップ) の両方のクラスを持つ
      expect(input).toHaveClass('text-base', 'md:text-sm');
    });
  });

  describe('フォーカススタイル', () => {
    test('フォーカス時のスタイルクラスが適用される', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-1',
        'focus-visible:ring-ring'
      );
    });
  });

  describe('ファイル入力スタイル', () => {
    test('ファイル入力のスタイルクラスが適用される', () => {
      render(<Input type="file" />);
      const input = screen.getByRole('textbox', { hidden: true }) || 
                    document.querySelector('input[type="file"]');
      
      expect(input).toHaveClass(
        'file:border-0',
        'file:bg-transparent',
        'file:text-sm',
        'file:font-medium',
        'file:text-foreground'
      );
    });
  });
});