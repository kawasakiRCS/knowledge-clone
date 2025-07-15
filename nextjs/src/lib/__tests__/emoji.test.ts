/**
 * emoji.tsのテスト
 * 
 * @description 絵文字変換機能のテスト
 */
import { convertEmoji, hasEmojiCode, getAvailableEmojiCodes, getEmoji } from '../emoji';

describe('emoji', () => {
  describe('convertEmoji', () => {
    test('基本的な絵文字変換が動作する', () => {
      expect(convertEmoji('Hello :smile: World')).toBe('Hello 😄 World');
      expect(convertEmoji('I :heart: you')).toBe('I ❤️ you');
      expect(convertEmoji(':thumbsup: Great job!')).toBe('👍 Great job!');
    });

    test('複数の絵文字を一度に変換できる', () => {
      expect(convertEmoji(':smile: :heart: :thumbsup:')).toBe('😄 ❤️ 👍');
    });

    test('存在しない絵文字コードはそのまま返す', () => {
      expect(convertEmoji(':nonexistent:')).toBe(':nonexistent:');
    });

    test('絵文字コードが含まれていないテキストはそのまま返す', () => {
      expect(convertEmoji('Hello World')).toBe('Hello World');
    });

    test('空文字列は空文字列を返す', () => {
      expect(convertEmoji('')).toBe('');
    });

    test('nullやundefinedは元の値を返す', () => {
      expect(convertEmoji(null as any)).toBe(null);
      expect(convertEmoji(undefined as any)).toBe(undefined);
    });

    test('文章内の絵文字コードが正しく変換される', () => {
      const text = 'こんにちは :smile: 今日はいい天気ですね :sun:';
      expect(convertEmoji(text)).toBe('こんにちは 😄 今日はいい天気ですね ☀️');
    });

    test('マークダウン形式のテキストでも動作する', () => {
      const markdown = '# Hello :smile:\n\nThis is a **bold** text with :heart: emoji.';
      expect(convertEmoji(markdown)).toBe('# Hello 😄\n\nThis is a **bold** text with ❤️ emoji.');
    });
  });

  describe('hasEmojiCode', () => {
    test('絵文字コードが含まれている場合trueを返す', () => {
      expect(hasEmojiCode('Hello :smile: World')).toBe(true);
      expect(hasEmojiCode(':heart:')).toBe(true);
      expect(hasEmojiCode('Text with :multiple: :emoji: codes')).toBe(true);
    });

    test('絵文字コードが含まれていない場合falseを返す', () => {
      expect(hasEmojiCode('Hello World')).toBe(false);
      expect(hasEmojiCode('Just plain text')).toBe(false);
      expect(hasEmojiCode('')).toBe(false);
    });

    test('不完全な絵文字コードの場合falseを返す', () => {
      expect(hasEmojiCode(':smile')).toBe(false);
      expect(hasEmojiCode('smile:')).toBe(false);
      expect(hasEmojiCode(': smile :')).toBe(false);
    });
  });

  describe('getAvailableEmojiCodes', () => {
    test('利用可能な絵文字コードの配列を返す', () => {
      const codes = getAvailableEmojiCodes();
      expect(Array.isArray(codes)).toBe(true);
      expect(codes.length).toBeGreaterThan(0);
      expect(codes).toContain(':smile:');
      expect(codes).toContain(':heart:');
      expect(codes).toContain(':thumbsup:');
    });

    test('すべてのコードが:で囲まれている', () => {
      const codes = getAvailableEmojiCodes();
      codes.forEach(code => {
        expect(code).toMatch(/^:[a-zA-Z0-9_+-]+:$/);
      });
    });
  });

  describe('getEmoji', () => {
    test('存在する絵文字コードに対して絵文字を返す', () => {
      expect(getEmoji(':smile:')).toBe('😄');
      expect(getEmoji(':heart:')).toBe('❤️');
      expect(getEmoji(':thumbsup:')).toBe('👍');
    });

    test('存在しない絵文字コードに対して元のコードを返す', () => {
      expect(getEmoji(':nonexistent:')).toBe(':nonexistent:');
    });
  });

  describe('特定の絵文字カテゴリーのテスト', () => {
    test('基本的な顔文字が正しく変換される', () => {
      expect(convertEmoji(':smile:')).toBe('😄');
      expect(convertEmoji(':grinning:')).toBe('😀');
      expect(convertEmoji(':wink:')).toBe('😉');
      expect(convertEmoji(':blush:')).toBe('😊');
    });

    test('ハート系絵文字が正しく変換される', () => {
      expect(convertEmoji(':heart:')).toBe('❤️');
      expect(convertEmoji(':yellow_heart:')).toBe('💛');
      expect(convertEmoji(':green_heart:')).toBe('💚');
      expect(convertEmoji(':blue_heart:')).toBe('💙');
    });

    test('手・指系絵文字が正しく変換される', () => {
      expect(convertEmoji(':thumbsup:')).toBe('👍');
      expect(convertEmoji(':thumbsdown:')).toBe('👎');
      expect(convertEmoji(':ok_hand:')).toBe('👌');
      expect(convertEmoji(':clap:')).toBe('👏');
    });

    test('自然系絵文字が正しく変換される', () => {
      expect(convertEmoji(':sun:')).toBe('☀️');
      expect(convertEmoji(':star:')).toBe('⭐');
      expect(convertEmoji(':fire:')).toBe('🔥');
      expect(convertEmoji(':snowflake:')).toBe('❄️');
    });

    test('動物系絵文字が正しく変換される', () => {
      expect(convertEmoji(':cat:')).toBe('🐱');
      expect(convertEmoji(':dog:')).toBe('🐶');
      expect(convertEmoji(':panda:')).toBe('🐼');
      expect(convertEmoji(':tiger:')).toBe('🐯');
    });

    test('食べ物系絵文字が正しく変換される', () => {
      expect(convertEmoji(':apple:')).toBe('🍎');
      expect(convertEmoji(':pizza:')).toBe('🍕');
      expect(convertEmoji(':hamburger:')).toBe('🍔');
      expect(convertEmoji(':coffee:')).toBe('☕');
    });

    test('数字系絵文字が正しく変換される', () => {
      expect(convertEmoji(':one:')).toBe('1️⃣');
      expect(convertEmoji(':two:')).toBe('2️⃣');
      expect(convertEmoji(':100:')).toBe('💯');
    });
  });
});