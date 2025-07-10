/**
 * Footerコンポーネントのテスト
 * 
 * @description フッターコンポーネントのテスト
 * @since 1.0.0
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Footer } from '../Footer';

describe('Footer', () => {
  describe('基本レンダリング', () => {
    test('フッターが表示される', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('id', 'footer');
    });

    test('フッターに適切なクラスが適用される', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('text-center', 'py-5', 'mt-15', 'bg-gray-600', 'text-gray-300', 'border-t');
    });
  });

  describe('ナビゲーションリンク', () => {
    test('Aboutリンクが表示される', () => {
      render(<Footer />);
      
      const aboutLink = screen.getByRole('link', { name: 'About' });
      expect(aboutLink).toBeInTheDocument();
      expect(aboutLink).toHaveAttribute('href', '/');
    });

    test('Manualリンクが表示される', () => {
      render(<Footer />);
      
      const manualLink = screen.getByRole('link', { name: 'Manual' });
      expect(manualLink).toBeInTheDocument();
      expect(manualLink).toHaveAttribute('href', 'https://information-knowledge.support-project.org/manual');
      expect(manualLink).toHaveAttribute('target', '_blank');
      expect(manualLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('Licenseリンクが表示される', () => {
      render(<Footer />);
      
      const licenseLink = screen.getByRole('link', { name: 'License' });
      expect(licenseLink).toBeInTheDocument();
      expect(licenseLink).toHaveAttribute('href', '/license');
    });

    test('言語リンクが表示される', () => {
      render(<Footer />);
      
      const languageLink = screen.getByRole('link', { name: /日本語/i });
      expect(languageLink).toBeInTheDocument();
      expect(languageLink).toHaveAttribute('href', '/language');
    });

    test('言語リンクにFont Awesomeアイコンが含まれる', () => {
      render(<Footer />);
      
      const languageLink = screen.getByRole('link', { name: /日本語/i });
      const icon = languageLink.querySelector('.fa-language');
      expect(icon).toBeInTheDocument();
    });

    test('すべてのリンクにホバー効果のクラスが適用される', () => {
      render(<Footer />);
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('text-gray-300', 'hover:text-white');
      });
    });
  });

  describe('ナビゲーション構造', () => {
    test('フッターナビゲーションがリスト形式で表示される', () => {
      render(<Footer />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      const list = nav.querySelector('ul');
      expect(list).toBeInTheDocument();
      expect(list).toHaveClass('flex', 'justify-center', 'items-center', 'space-x-0', 'text-sm');
    });

    test('リストアイテムに境界線が適用される', () => {
      render(<Footer />);
      
      const listItems = document.querySelectorAll('li');
      
      // 最初のリスト項目は左境界線のみ
      expect(listItems[0]).toHaveClass('border-l', 'border-black');
      
      // 最後のリスト項目は左右境界線
      const lastItem = listItems[listItems.length - 1];
      expect(lastItem).toHaveClass('border-l', 'border-r', 'border-black');
    });
  });

  describe('コピーライト', () => {
    test('コピーライトが表示される', () => {
      const currentYear = new Date().getFullYear();
      render(<Footer />);
      
      expect(screen.getByText(`Copyright © 2015 - ${currentYear}`)).toBeInTheDocument();
    });

    test('support-project.orgリンクが含まれる', () => {
      render(<Footer />);
      
      const supportLink = screen.getByRole('link', { name: 'support-project.org' });
      expect(supportLink).toBeInTheDocument();
      expect(supportLink).toHaveAttribute('href', 'https://support-project.org/knowledge_info/index');
      expect(supportLink).toHaveAttribute('target', '_blank');
      expect(supportLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('コピーライト部分に適切なスタイルが適用される', () => {
      render(<Footer />);
      
      const copyrightDiv = document.querySelector('.mt-4');
      expect(copyrightDiv).toBeInTheDocument();
      
      const copyrightSpan = copyrightDiv?.querySelector('span');
      expect(copyrightSpan).toHaveClass('text-gray-300', 'text-sm');
    });
  });

  describe('ページトップボタン', () => {
    test('ページトップボタンが表示される', () => {
      render(<Footer />);
      
      const pageTopButton = screen.getByRole('button', { name: 'ページトップへ戻る' });
      expect(pageTopButton).toBeInTheDocument();
    });

    test('ページトップボタンに適切なクラスが適用される', () => {
      render(<Footer />);
      
      const pageTopButton = screen.getByRole('button', { name: 'ページトップへ戻る' });
      expect(pageTopButton).toHaveClass(
        'fixed', 'bottom-4', 'right-4', 'p-3', 'rounded-full',
        'bg-gray-600', 'text-white', 'shadow-lg',
        'hover:bg-gray-700', 'transition-all', 'duration-300',
        'focus:outline-none', 'focus:ring-2', 'focus:ring-gray-500',
        'opacity-80', 'hover:opacity-100'
      );
    });

    test('ページトップボタンにFont Awesomeアイコンが含まれる', () => {
      render(<Footer />);
      
      const pageTopButton = screen.getByRole('button', { name: 'ページトップへ戻る' });
      const icon = pageTopButton.querySelector('.fa-arrow-up');
      expect(icon).toBeInTheDocument();
    });

    test('ページトップボタンをクリックするとスクロールする', async () => {
      const user = userEvent.setup();
      
      // Element.scrollIntoViewとwindow.scrollToをモック
      const scrollIntoViewMock = jest.fn();
      const scrollToMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;
      window.scrollTo = scrollToMock;
      
      // content_top要素を作成
      const contentTopElement = document.createElement('div');
      contentTopElement.id = 'content_top';
      document.body.appendChild(contentTopElement);
      
      render(<Footer />);
      
      const pageTopButton = screen.getByRole('button', { name: 'ページトップへ戻る' });
      await user.click(pageTopButton);
      
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
      
      // クリーンアップ
      document.body.removeChild(contentTopElement);
    });

    test('content_top要素がない場合はwindow.scrollToが呼ばれる', async () => {
      const user = userEvent.setup();
      
      const scrollToMock = jest.fn();
      window.scrollTo = scrollToMock;
      
      render(<Footer />);
      
      const pageTopButton = screen.getByRole('button', { name: 'ページトップへ戻る' });
      await user.click(pageTopButton);
      
      expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('旧システム互換性', () => {
    test('旧システムのフッター構造と同等', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('id', 'footer');
      expect(footer).toHaveClass('text-center', 'py-5');
    });

    test('旧システムのページトップボタンと同等の位置', () => {
      render(<Footer />);
      
      const pageTopButton = screen.getByRole('button', { name: 'ページトップへ戻る' });
      expect(pageTopButton).toHaveClass('fixed', 'bottom-4', 'right-4');
    });

    test('旧システムの色設定と同等', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('bg-gray-600', 'text-gray-300');
    });
  });

  describe('アクセシビリティ', () => {
    test('フッターにrole="contentinfo"が設定されている', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    test('ナビゲーションにrole="navigation"が設定されている', () => {
      render(<Footer />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    test('ページトップボタンに適切なaria-labelが設定されている', () => {
      render(<Footer />);
      
      const pageTopButton = screen.getByRole('button', { name: 'ページトップへ戻る' });
      expect(pageTopButton).toHaveAttribute('aria-label', 'ページトップへ戻る');
    });

    test('外部リンクに適切なrel属性が設定されている', () => {
      render(<Footer />);
      
      const externalLinks = [
        screen.getByRole('link', { name: 'Manual' }),
        screen.getByRole('link', { name: 'support-project.org' })
      ];
      
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });
});