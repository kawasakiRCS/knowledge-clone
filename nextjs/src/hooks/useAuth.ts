/**
 * 認証情報を管理するカスタムフック
 * TODO: 実際の認証実装に置き換える
 */
export function useAuth() {
  // TODO: 実際の認証状態を管理する実装
  // 現在はモック実装
  return {
    user: null, // ログインしていない状態
    isAuthenticated: false, // 認証状態
    isLoading: false,
    login: async () => {
      // TODO: ログイン処理
    },
    logout: async () => {
      // ログアウト処理
    },
  };
}