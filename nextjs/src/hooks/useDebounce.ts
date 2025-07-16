/**
 * デバウンス機能を提供するカスタムフック
 * 
 * @description 入力値の変更を指定時間遅延させる
 * @description API呼び出しの頻度を制御するために使用
 */
import { useEffect, useState } from 'react';

/**
 * 値の変更を指定時間遅延させる
 * 
 * @param value 監視する値
 * @param delay 遅延時間（ミリ秒）
 * @returns 遅延された値
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}