/**
 * 簡易ナビゲーションバーコンポーネント（認証なし）
 * 
 * @description 認証機能なしの基本ナビバー（ビルドテスト用）
 * @since 1.0.0
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SimpleNavbar() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      window.location.href = `/knowledge/list?keyword=${encodeURIComponent(searchKeyword)}`;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ブランド */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mr-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link 
              href="/knowledge/list"
              className="flex items-center space-x-2 text-xl font-bold text-gray-800 hover:text-gray-600"
            >
              <i className="fa fa-book text-blue-600"></i>
              <span>Knowledge</span>
            </Link>
          </div>

          {/* 検索フォーム - デスクトップ */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8"
          >
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="ナレッジを検索..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* 右側メニュー */}
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline">
              <Link href="/signin">
                <i className="fa fa-sign-in mr-2"></i>
                サインイン
              </Link>
            </Button>
          </div>
        </div>

        {/* モバイル検索フォーム */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <Input
                type="text"
                placeholder="ナレッジを検索..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}