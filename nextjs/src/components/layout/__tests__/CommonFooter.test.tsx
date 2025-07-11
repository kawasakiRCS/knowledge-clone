/**
 * CommonFooterコンポーネントのテスト
 * 
 * @description 旧システムのcommonFooter.jspを移植したフッターのテスト
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommonFooter } from '../CommonFooter';

// useLocaleフックをモック
jest.mock('@/lib/hooks/useLocale', () => ({
  useLocale: () => ({
    locale: 'ja',
    displayName: '日本語',
    flagIcon: 'jp',
    updateLocale: jest.fn(),
    availableLocales: [
      { code: 'ja', displayName: '日本語', flagIcon: 'jp' },
      { code: 'en', displayName: 'English', flagIcon: 'us' },
    ],
  }),
}));

describe('CommonFooter', () => {
  describe('基本レンダリング', () => {
    test('フッターが表示される', () => {
      render(<CommonFooter />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('id', 'footer');
    });

    test('フッターにcommon.cssの構造が適用される', () => {
      render(<CommonFooter />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('text-center');
      // 旧システムでのCSS: #footer { background-color: #7E7E7E; color: #cccccc; }
    });
  });

  describe('旧システム互換性: フッターメニュー', () => {
    test('footer-menuクラスとlist-inlineクラスが適用される', () => {
      render(<CommonFooter />);
      
      const footerMenu = document.querySelector('.footer-menu');
      expect(footerMenu).toBeInTheDocument();
      expect(footerMenu).toHaveClass('list-inline');
    });

    test('最初のリスト項目にfirstクラスが適用される', () => {
      render(<CommonFooter />);
      
      const firstItem = document.querySelector('.footer-menu li.first');
      expect(firstItem).toBeInTheDocument();
    });

    test('Aboutリンクが正しく表示される', () => {
      render(<CommonFooter />);
      
      const aboutLink = screen.getByRole('link', { name: 'このアプリについて' });
      expect(aboutLink).toBeInTheDocument();
      expect(aboutLink).toHaveAttribute('href', '/index');
      expect(aboutLink.getAttribute('style')).toContain('cursor: pointer');
    });

    test('オンラインマニュアルリンクが正しく表示される', () => {
      render(<CommonFooter />);
      
      const manualLink = screen.getByRole('link', { name: 'オンラインマニュアル' });
      expect(manualLink).toBeInTheDocument();
      expect(manualLink).toHaveAttribute('href', 'https://information-knowledge.support-project.org/manual');
      expect(manualLink.getAttribute('style')).toContain('cursor: pointer');
    });

    test('ライセンスリンクが正しく表示される', () => {
      render(<CommonFooter />);
      
      const licenseLink = screen.getByRole('link', { name: 'ライセンス' });
      expect(licenseLink).toBeInTheDocument();
      expect(licenseLink).toHaveAttribute('href', '/open.license');
    });

    test('言語リンクが正しく表示される', () => {
      render(<CommonFooter />);
      
      // useLocaleフックから取得されるdisplayNameをチェック
      const languageLink = screen.getByRole('link', { name: /日本語|English/ });
      expect(languageLink).toBeInTheDocument();
      expect(languageLink).toHaveAttribute('href', '/open.language');
    });

    test('言語リンクにfa-languageアイコンが含まれる', () => {
      render(<CommonFooter />);
      
      const languageIcon = document.querySelector('.fa.fa-language');
      expect(languageIcon).toBeInTheDocument();
    });
  });

  describe('旧システム互換性: コピーライト', () => {
    test('clearfixクラスが適用される', () => {
      render(<CommonFooter />);
      
      const clearfix = document.querySelector('.clearfix');
      expect(clearfix).toBeInTheDocument();
    });

    test('copyクラスが適用される', () => {
      render(<CommonFooter />);
      
      const copyDiv = document.querySelector('.copy');
      expect(copyDiv).toBeInTheDocument();
    });

    test('コピーライトテキストが正確に表示される', () => {
      render(<CommonFooter />);
      
      expect(screen.getByText(/Copyright © 2015 - 2017/)).toBeInTheDocument();
    });

    test('support-project.orgリンクが正確に表示される', () => {
      render(<CommonFooter />);
      
      const supportLink = screen.getByRole('link', { name: 'support-project.org' });
      expect(supportLink).toBeInTheDocument();
      expect(supportLink).toHaveAttribute('href', 'https://support-project.org/knowledge_info/index');
    });
  });

  describe('旧システム互換性: ページトップボタン', () => {
    test('pagetopクラスが適用される', () => {
      render(<CommonFooter />);
      
      const pagetop = document.querySelector('.pagetop');
      expect(pagetop).toBeInTheDocument();
    });

    test('初期状態でdisplay: noneが適用される', () => {
      render(<CommonFooter />);
      
      const pagetop = document.querySelector('.pagetop');
      expect(pagetop).toHaveStyle('display: none');
    });

    test('content_topへのリンクが正しく設定される', () => {
      render(<CommonFooter />);
      
      // display: noneで隠れているため、getByLabelTextを使用
      const pagetopLink = document.querySelector('.pagetop a');
      expect(pagetopLink).toBeInTheDocument();
      expect(pagetopLink).toHaveAttribute('href', '#content_top');
      expect(pagetopLink).toHaveAttribute('aria-label', 'ページトップへ戻る');
    });

    test('fa-arrow-upアイコンが含まれる', () => {
      render(<CommonFooter />);
      
      const arrowIcon = document.querySelector('.fa.fa-arrow-up');
      expect(arrowIcon).toBeInTheDocument();
      expect(arrowIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('CSS構造互換性', () => {
    test('旧システムの#footerセレクタと同等のID', () => {
      render(<CommonFooter />);
      
      const footer = document.querySelector('#footer');
      expect(footer).toBeInTheDocument();
    });

    test('旧システムの.footer-menu構造と同等', () => {
      render(<CommonFooter />);
      
      const footerMenu = document.querySelector('#footer .footer-menu');
      expect(footerMenu).toBeInTheDocument();
    });

    test('旧システムのリスト項目構造と同等', () => {
      render(<CommonFooter />);
      
      const listItems = document.querySelectorAll('#footer .footer-menu li');
      expect(listItems).toHaveLength(4);
      
      // 最初のli要素にfirstクラス
      expect(listItems[0]).toHaveClass('first');
      
      // 各li要素にはaタグが含まれる
      listItems.forEach(li => {
        const link = li.querySelector('a');
        expect(link).toBeInTheDocument();
      });
    });

    test('旧システムの.copyクラス構造と同等', () => {
      render(<CommonFooter />);
      
      const copyDiv = document.querySelector('#footer .copy');
      expect(copyDiv).toBeInTheDocument();
      
      const copySpan = copyDiv?.querySelector('span');
      expect(copySpan).toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('Aboutリンククリック動作', async () => {
      const user = userEvent.setup();
      render(<CommonFooter />);
      
      const aboutLink = screen.getByRole('link', { name: 'このアプリについて' });
      await user.click(aboutLink);
      
      // リンクがクリック可能であることを確認
      expect(aboutLink).toBeEnabled();
    });

    test('外部リンクのクリック動作', async () => {
      const user = userEvent.setup();
      render(<CommonFooter />);
      
      const manualLink = screen.getByRole('link', { name: 'オンラインマニュアル' });
      await user.click(manualLink);
      
      expect(manualLink).toBeEnabled();
    });
  });

  describe('アクセシビリティ', () => {
    test('フッターにrole="contentinfo"が設定される', () => {
      render(<CommonFooter />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    test('ナビゲーションリンクが適切にラベル付けされる', () => {
      render(<CommonFooter />);
      
      const links = [
        'このアプリについて',
        'オンラインマニュアル', 
        'ライセンス',
        'support-project.org'
      ];
      
      links.forEach(linkText => {
        const link = screen.getByRole('link', { name: new RegExp(linkText, 'i') });
        expect(link).toBeInTheDocument();
      });
    });

    test('アイコンにaria-hiddenが適切に設定される', () => {
      render(<CommonFooter />);
      
      const hiddenIcons = document.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });
  });
});