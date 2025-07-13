/**
 * NextAuth設定オプション
 * 
 * @description 旧システムのJavaセッション認証をNextAuthで再実装
 */
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { LoginFormData, LoginedUser } from '@/types/auth';

/**
 * NextAuth設定
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        loginId: { label: 'Login ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.loginId || !credentials?.password) {
          return null;
        }

        try {
          // 旧システムの認証APIエンドポイントを呼び出し
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              loginId: credentials.loginId,
              password: credentials.password,
            } as any),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.user) {
              return result.user as LoginedUser;
            }
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24時間（旧システムと同等）
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).userId;
        token.userName = (user as any).userName;
        token.role = (user as any).role;
        token.unreadCount = (user as any).unreadCount;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).user = {
          userId: token.userId as number,
          userName: token.userName as string,
          role: token.role as string,
          unreadCount: token.unreadCount as number,
        } as any;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/authorizer_error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};