/**
 * 認証情報を管理するカスタムフック
 * TODO: 実際の認証実装に置き換える
 */
export function useAuth() {
  // TODO: 実際の認証状態を管理する実装
  // 現在はモック実装
  return {
    user: null, // ログインしていない状態
    isLoading: false,
    login: async (email: string, password: string) => {
      // ログイン処理
    },
    logout: async () => {
      // ログアウト処理
    },
  };
}