const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

/**
 * TDD強制用Jest設定
 * 
 * @description カバレッジ閾値80%、厳格なテスト実行環境を提供
 * @see CLAUDE.md - TDD必須ルール
 */
const customJestConfig = {
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // テスト実行環境
  testEnvironment: 'jest-environment-jsdom',
  
  // モジュールパス解決
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/app/components/$1',
  },
  
  // カバレッジ収集対象
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  
  // テストファイルパターン
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/app/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/app/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/components/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/components/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  
  // TDD強制：カバレッジ閾値80% - テスト失敗でhooks拒否
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // カバレッジレポート設定
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],
  
  // 変換除外パターン（ESM ライブラリを変換対象に含める）
  transformIgnorePatterns: [
    '/node_modules/(?!(react-markdown|remark-.*|rehype-.*|micromark|decode-uri-component|split-on-first|filter-obj|query-string|unified|bail|is-plain-obj|trough|vfile|unist-.*|mdast-.*|hast-.*|property-information|space-separated-tokens|comma-separated-tokens|zwitch|html-void-elements|ccount|escape-string-regexp|markdown-table|trim-lines))',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  
  // TDD用：テスト実行設定
  testTimeout: 10000,
  verbose: true,
  maxWorkers: '50%',
  
  // TDD用：ファイル監視設定
  watchman: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)