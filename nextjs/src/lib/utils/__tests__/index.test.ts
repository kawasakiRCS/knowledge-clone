/**
 * Utility functions テスト
 * 
 * @description ユーティリティ関数のテストケース
 */
import { describe, test, expect } from '@jest/globals';
import { cn } from '../index';

describe('cn utility function', () => {
  test('単一のクラス名を処理する', () => {
    const result = cn('bg-red-500');
    expect(result).toBe('bg-red-500');
  });

  test('複数のクラス名を結合する', () => {
    const result = cn('bg-red-500', 'text-white', 'p-4');
    expect(result).toBe('bg-red-500 text-white p-4');
  });

  test('空文字列を適切に処理する', () => {
    const result = cn('', 'text-white', '');
    expect(result).toBe('text-white');
  });

  test('undefinedやnullを適切に処理する', () => {
    const result = cn('bg-red-500', undefined, null, 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  test('条件付きクラスを処理する', () => {
    const isActive = true;
    const isDisabled = false;
    
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class'
    );
    
    expect(result).toBe('base-class active-class');
  });

  test('配列形式のクラス名を処理する', () => {
    const result = cn(['bg-red-500', 'text-white'], 'p-4');
    expect(result).toBe('bg-red-500 text-white p-4');
  });

  test('オブジェクト形式のクラス名を処理する', () => {
    const result = cn({
      'bg-red-500': true,
      'text-white': true,
      'p-4': false,
      'border': true
    });
    
    expect(result).toBe('bg-red-500 text-white border');
  });

  test('Tailwind CSSのクラス競合を解決する', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });

  test('複雑なTailwind CSSクラス競合を解決する', () => {
    const result = cn(
      'bg-red-500 text-white',
      'bg-blue-500',
      'text-black'
    );
    
    expect(result).toBe('bg-blue-500 text-black');
  });

  test('引数なしでも動作する', () => {
    const result = cn();
    expect(result).toBe('');
  });

  test('複数の競合するクラス名を適切に処理する', () => {
    const result = cn(
      'p-2 m-2',
      'p-4',
      'm-4'
    );
    
    expect(result).toBe('p-4 m-4');
  });

  test('レスポンシブクラスの競合を解決する', () => {
    const result = cn(
      'text-sm md:text-base',
      'text-lg'
    );
    
    expect(result).toBe('md:text-base text-lg');
  });

  test('ダークモードクラスの競合を解決する', () => {
    const result = cn(
      'bg-white dark:bg-gray-900',
      'bg-gray-100'
    );
    
    expect(result).toBe('dark:bg-gray-900 bg-gray-100');
  });

  test('ホバー状態クラスの競合を解決する', () => {
    const result = cn(
      'bg-blue-500 hover:bg-blue-600',
      'bg-red-500'
    );
    
    expect(result).toBe('hover:bg-blue-600 bg-red-500');
  });

  test('複雑な条件付きクラス結合', () => {
    const variant = 'primary';
    const size = 'large';
    const isDisabled = false;
    
    const result = cn(
      'base-button',
      {
        'btn-primary': variant === 'primary',
        'btn-secondary': variant === 'secondary',
        'btn-large': size === 'large',
        'btn-small': size === 'small',
        'btn-disabled': isDisabled
      }
    );
    
    expect(result).toBe('base-button btn-primary btn-large');
  });
});