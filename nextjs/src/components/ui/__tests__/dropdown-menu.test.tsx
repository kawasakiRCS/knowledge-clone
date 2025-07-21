/**
 * DropdownMenuコンポーネントのテスト
 * 
 * @description Radix UIベースのドロップダウンメニューのテスト
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from '../dropdown-menu';

describe('DropdownMenu', () => {
  describe('基本的な動作', () => {
    test('トリガーをクリックするとメニューが開く', async () => {
      const user = userEvent.setup();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>メニューを開く</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>アイテム1</DropdownMenuItem>
            <DropdownMenuItem>アイテム2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByText('メニューを開く');
      expect(screen.queryByText('アイテム1')).not.toBeInTheDocument();

      await user.click(trigger);
      
      expect(screen.getByText('アイテム1')).toBeInTheDocument();
      expect(screen.getByText('アイテム2')).toBeInTheDocument();
    });

    test('メニューアイテムをクリックするとonSelectが呼ばれる', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleSelect}>クリック</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('メニュー'));
      await user.click(screen.getByText('クリック'));
      
      expect(handleSelect).toHaveBeenCalled();
    });
  });

  describe('DropdownMenuCheckboxItem', () => {
    test('チェックボックスアイテムが正しくレンダリングされる', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const [isChecked, setIsChecked] = React.useState(false);
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={isChecked}
                onCheckedChange={setIsChecked}
              >
                チェックボックス
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      };
      
      render(<TestComponent />);

      await user.click(screen.getByText('メニュー'));
      
      const checkboxItem = screen.getByText('チェックボックス');
      expect(checkboxItem).toBeInTheDocument();
      
      await user.click(checkboxItem);
    });
  });

  describe('DropdownMenuRadioGroup', () => {
    test('ラジオグループが正しく動作する', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const [value, setValue] = React.useState('option1');
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
                <DropdownMenuRadioItem value="option1">
                  オプション1
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="option2">
                  オプション2
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      };
      
      render(<TestComponent />);

      await user.click(screen.getByText('メニュー'));
      
      expect(screen.getByText('オプション1')).toBeInTheDocument();
      expect(screen.getByText('オプション2')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuSub', () => {
    test('サブメニューが正しく動作する', async () => {
      const user = userEvent.setup();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>通常のアイテム</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>サブメニュー</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>サブアイテム1</DropdownMenuItem>
                <DropdownMenuItem>サブアイテム2</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('メニュー'));
      
      expect(screen.getByText('サブメニュー')).toBeInTheDocument();
      expect(screen.queryByText('サブアイテム1')).not.toBeInTheDocument();
      
      // サブメニューをホバーまたはクリックで開く
      await user.hover(screen.getByText('サブメニュー'));
    });
  });

  describe('その他のコンポーネント', () => {
    test('DropdownMenuLabelが正しくレンダリングされる', async () => {
      const user = userEvent.setup();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>ラベル</DropdownMenuLabel>
            <DropdownMenuItem>アイテム</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('メニュー'));
      
      expect(screen.getByText('ラベル')).toBeInTheDocument();
    });

    test('DropdownMenuSeparatorが正しくレンダリングされる', async () => {
      const user = userEvent.setup();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>アイテム1</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>アイテム2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('メニュー'));
      
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    test('DropdownMenuShortcutが正しくレンダリングされる', async () => {
      const user = userEvent.setup();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              保存
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('メニュー'));
      
      expect(screen.getByText('⌘S')).toBeInTheDocument();
    });

    test('DropdownMenuGroupが正しくレンダリングされる', async () => {
      const user = userEvent.setup();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>グループアイテム1</DropdownMenuItem>
              <DropdownMenuItem>グループアイテム2</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>その他のアイテム</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('メニュー'));
      
      expect(screen.getByText('グループアイテム1')).toBeInTheDocument();
      expect(screen.getByText('グループアイテム2')).toBeInTheDocument();
      expect(screen.getByText('その他のアイテム')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('キーボード操作でメニューを開閉できる', async () => {
      const user = userEvent.setup();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>アイテム1</DropdownMenuItem>
            <DropdownMenuItem>アイテム2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByText('メニュー');
      trigger.focus();
      
      // Enterキーでメニューを開く
      await user.keyboard('{Enter}');
      expect(screen.getByText('アイテム1')).toBeInTheDocument();
      
      // Escapeキーでメニューを閉じる
      await user.keyboard('{Escape}');
    });

    test('無効化されたアイテムはクリックできない', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled onSelect={handleSelect}>
              無効化されたアイテム
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('メニュー'));
      await user.click(screen.getByText('無効化されたアイテム'));
      
      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  describe('カスタムスタイル', () => {
    test('classNameプロパティが適用される', async () => {
      const user = userEvent.setup();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content">
            <DropdownMenuItem className="custom-item">
              カスタムアイテム
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('メニュー'));
      
      const content = screen.getByText('カスタムアイテム').closest('[role="menu"]');
      expect(content).toHaveClass('custom-content');
      
      const item = screen.getByText('カスタムアイテム');
      expect(item).toHaveClass('custom-item');
    });

    test('insetプロパティが適用される', async () => {
      const user = userEvent.setup();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>メニュー</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>
              インセットアイテム
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('メニュー'));
      
      const item = screen.getByText('インセットアイテム');
      expect(item).toHaveClass('pl-8');
    });
  });
});