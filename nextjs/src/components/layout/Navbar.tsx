/**
 * ナビゲーションバーコンポーネント
 * 
 * @description 旧システムのcommonNavbar.jspを移植したナビバー
 * ブランド、検索、ユーザーメニューを含む
 * @since 1.0.0
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { Search, Plus, Star, Menu, Bell, User, Settings, LogOut } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const { data: session, status } = useSession();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLoggedIn = status === 'authenticated';

  // 未読通知数（仮実装）
  const unreadCount = 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      // 検索ページに遷移
      window.location.href = `/knowledge/list?keyword=${encodeURIComponent(searchKeyword)}`;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ブランド */}
          <div className="flex items-center">
            {/* モバイルメニューボタン */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mr-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* ブランドロゴ */}
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
            {isLoggedIn ? (
              <>
                {/* 追加ボタン */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">追加</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/knowledge/add">
                        <Plus className="h-4 w-4 mr-2" />
                        ナレッジ追加
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/draft/list">
                        <i className="fa fa-database mr-2"></i>
                        下書き一覧
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* ストックボタン */}
                <Button 
                  asChild
                  className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-full"
                >
                  <Link href="/stock/mylist">
                    <Star className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">ストック</span>
                  </Link>
                </Button>

                {/* ユーザーメニュー */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600 rounded-full relative"
                    >
                      <Image
                        src={session?.user?.image || '/images/default-avatar.png'}
                        alt="User Icon"
                        width={20}
                        height={20}
                        className="rounded-full mr-2"
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/knowledge/list">
                        <i className="fa fa-list mr-2"></i>
                        ナレッジ一覧
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/notification/list">
                        <Bell className="h-4 w-4 mr-2" />
                        通知
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/knowledge/search">
                        <Search className="h-4 w-4 mr-2" />
                        検索
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* 管理者メニュー - TODO: 管理者判定ロジックを実装 */}
                    {false && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/systemconfig">
                            <i className="fa fa-cogs mr-2"></i>
                            システム設定
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/config">
                        <Settings className="h-4 w-4 mr-2" />
                        設定
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => signOut()}
                      className="text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      サインアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* 未ログイン時のメニュー */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/knowledge/list">
                      <i className="fa fa-list mr-2"></i>
                      ナレッジ一覧
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/knowledge/search">
                      <Search className="h-4 w-4 mr-2" />
                      検索
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/signin">
                      <i className="fa fa-sign-in mr-2"></i>
                      サインイン
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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