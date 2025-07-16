/**
 * タグ入力コンポーネント
 * 
 * @description 旧システムのBootstrap Tagsinputの代替実装
 * @description 既存タグの候補表示とタグ選択機能を含む
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface Tag {
  tagId: number;
  tagName: string;
}

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * タグ入力コンポーネント
 * 
 * @description カンマ区切りでタグを入力、既存タグの候補表示
 */
export const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = 'タグを入力してください',
  maxTags = 20,
  className = '',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // 入力値のデバウンス
  const debouncedInput = useDebounce(inputValue, 300);

  // 既存タグの候補を取得
  useEffect(() => {
    if (debouncedInput.trim().length > 0) {
      fetchTagSuggestions(debouncedInput);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedInput]);

  /**
   * タグ候補を取得
   */
  const fetchTagSuggestions = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/open/tags/json?keyword=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success && data.tags) {
        // 既に追加されているタグは除外
        const filteredTags = data.tags.filter((tag: Tag) => 
          !value.includes(tag.tagName.toLowerCase())
        );
        setSuggestions(filteredTags);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('タグ候補の取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * タグを追加
   */
  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim();
    if (trimmedTag === '') return;
    
    const normalizedTag = trimmedTag.toLowerCase();
    
    // 重複チェック
    if (value.some(tag => tag.toLowerCase() === normalizedTag)) {
      return;
    }
    
    // 最大タグ数チェック
    if (value.length >= maxTags) {
      alert(`タグは最大${maxTags}個まで設定できます`);
      return;
    }
    
    const newTags = [...value, trimmedTag];
    onChange(newTags);
    setInputValue('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  /**
   * タグを削除
   */
  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  /**
   * 入力値変更ハンドラー
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setInputValue(inputValue);
    
    // カンマが入力されたらタグを追加
    if (inputValue.includes(',')) {
      const tags = inputValue.split(',').map(tag => tag.trim()).filter(tag => tag);
      tags.forEach(tag => addTag(tag));
    }
  };

  /**
   * キーボード操作ハンドラー
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        addTag(suggestions[selectedIndex].tagName);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // 入力が空の場合、最後のタグを削除
      removeTag(value.length - 1);
    }
  };

  /**
   * 候補をクリック
   */
  const handleSuggestionClick = (tag: Tag) => {
    addTag(tag.tagName);
    inputRef.current?.focus();
  };

  /**
   * フォーカスアウト時の処理
   */
  const handleBlur = () => {
    // 少し遅延させて候補クリックを有効にする
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className={`tag-input-container ${className}`}>
      <div className="tag-input-wrapper">
        {/* 追加されたタグ */}
        <div className="tag-list">
          {value.map((tag, index) => (
            <span key={index} className="tag-item">
              <span className="tag-name">{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => removeTag(index)}
                  aria-label={`${tag}を削除`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>

        {/* 入力フィールド */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          className="tag-input"
          disabled={disabled}
          autoComplete="off"
        />
      </div>

      {/* 候補リスト */}
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="tag-suggestions">
          {isLoading && (
            <div className="suggestion-item loading">
              <span className="text-muted">検索中...</span>
            </div>
          )}
          {suggestions.map((tag, index) => (
            <div
              key={tag.tagId}
              className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(tag)}
            >
              <i className="fa fa-tag"></i> {tag.tagName}
            </div>
          ))}
        </div>
      )}

      {/* スタイル定義 */}
      <style jsx>{`
        .tag-input-container {
          position: relative;
        }

        .tag-input-wrapper {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          min-height: 34px;
          padding: 6px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #fff;
          cursor: text;
        }

        .tag-input-wrapper:focus-within {
          border-color: #66afe9;
          outline: 0;
          box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-right: 8px;
        }

        .tag-item {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          background-color: #5bc0de;
          color: white;
          border-radius: 3px;
          font-size: 12px;
          line-height: 1.4;
        }

        .tag-name {
          margin-right: 4px;
        }

        .tag-remove {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
          padding: 0;
          margin-left: 4px;
        }

        .tag-remove:hover {
          color: #ccc;
        }

        .tag-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          min-width: 100px;
          padding: 0;
          font-size: 14px;
        }

        .tag-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 4px 4px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .suggestion-item {
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .suggestion-item:hover,
        .suggestion-item.selected {
          background-color: #f5f5f5;
        }

        .suggestion-item.loading {
          cursor: default;
          font-style: italic;
        }

        .suggestion-item.loading:hover {
          background-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default TagInput;