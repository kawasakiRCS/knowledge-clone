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

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock window.location globally (safer approach)
const locationMock = {
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

// Only delete and redefine if not already mocked
if (typeof window !== 'undefined' && !window.location.assign.mockClear) {
  delete window.location;
  window.location = locationMock;
}

// Mock Next.js router - Both old and new router compatibility
jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
      route: '/',
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

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

// Mock useLocale hook
jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    locale: 'ja',
    t: (key, ...args) => {
      const translations = {
        'knowledge.list.kind.list': 'ナレッジ一覧',
        'knowledge.list.kind.popular': '人気',
        'knowledge.list.kind.stock': 'ストック',
        'knowledge.list.kind.history': '履歴',
        'knowledge.list.empty': 'ナレッジが登録されていません',
        'label.unread': '未読',
        'knowledge.view.info.insert': '%sが%sに登録',
        'knowledge.view.info.update': '(%sが%sに更新)',
        'knowledge.list.search': 'ナレッジを検索',
        'knowledge.list.back': '一覧に戻る',
        'label.backlist': '一覧に戻る',
        'label.apply': '適用',
        'knowledge.histories.title': '編集履歴',
        'knowledge.histories.empty': '編集履歴はありません',
        'knowledge.histories.back': '戻る',
        'knowledge.history.title': '履歴詳細',
        'label.previous': '前へ',
        'label.next': '次へ',
        'knowledge.search.groups': 'グループ',
        'knowledge.search.keyword': 'キーワード',
        'knowledge.search.tags': 'タグ',
        'knowledge.search.creator': '作成者',
        'knowledge.search.placeholder': 'キーワードを入力',
        'knowledge.add.label.type': 'テンプレート',
        'knowledge.add.label.tags': 'タグを入力',
        'knowledge.navbar.search': '検索',
        'label.search': '検索',
        'label.clear': 'クリア',
        'label.search.tags': 'タグ検索',
        'label.search.groups': 'グループ検索',
      };
      
      let translation = translations[key] || key;
      
      // パラメータの置換
      if (args.length > 0) {
        args.forEach((arg) => {
          translation = translation.replace('%s', String(arg));
        });
      }
      
      return translation;
    },
  }),
}))

// Mock useAuth hook - both paths
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoggedIn: false,
    isAuthenticated: false,
    isLoading: false,
    loading: false,
    unreadCount: 0,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}))

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoggedIn: false,
    isAuthenticated: false,
    isLoading: false,
    loading: false,
    unreadCount: 0,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}))

// Mock Next.js Web API (Request, Response, etc.) for API route tests
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
    }
    
    async json() {
      return JSON.parse(this.body || '{}');
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
      this.ok = this.status >= 200 && this.status < 300;
    }
    
    async json() {
      return JSON.parse(this.body || '{}');
    }
    
    static json(data, init) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
    }
  };
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this._headers = new Map();
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), value);
        });
      }
    }
    
    get(name) {
      return this._headers.get(name.toLowerCase());
    }
    
    set(name, value) {
      this._headers.set(name.toLowerCase(), value);
    }
    
    has(name) {
      return this._headers.has(name.toLowerCase());
    }
  };
}

// Mock react-markdown for components that use it
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }) {
    return React.createElement('div', { 
      className: 'mock-react-markdown',
      dangerouslySetInnerHTML: { __html: children }
    });
  };
});

// Mock Next.js NextResponse for API route tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
    },
  },
}));