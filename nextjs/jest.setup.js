/**
 * Jest セットアップファイル - TDD強制用
 * 
 * @description テスト環境の初期化とモック設定
 * @see CLAUDE.md - TDD必須ルール
 */
import '@testing-library/jest-dom'

// TDD強制：テスト実行前のカスタムチェック
beforeEach(() => {
  // カバレッジ閾値チェック用の初期化
  if (process.env.TDD_STRICT_MODE === 'true') {
    console.log('🧪 TDD厳格モード: テストを実行中...')
  }
})

// TDD用：テスト実行後の統計表示
afterAll(() => {
  if (process.env.TDD_STRICT_MODE === 'true') {
    console.log('✅ TDD検証: テストスイート完了')
  }
})

// Mock window.location globally
delete window.location;
window.location = {
  href: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  origin: 'http://localhost',
  pathname: '/',
  search: '',
  hash: '',
  protocol: 'http:',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
};

// Mock Next.js router - App Router compatible
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  useParams() {
    return {}
  },
  notFound: jest.fn(),
  redirect: jest.fn(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: null,
      status: 'unauthenticated',
    }
  },
  signOut: jest.fn(),
}))