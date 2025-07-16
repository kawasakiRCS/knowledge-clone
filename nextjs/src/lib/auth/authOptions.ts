/**
 * NextAuth設定オプション
 * 
 * @description 旧システムのJavaセッション認証をNextAuthで再実装
 */
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { LoginFormData, LoginedUser } from '@/types/auth';
import { findEntraIdUserAlias, createEntraIdUserAlias, ENTRAID_AUTH_KEY } from '@/repositories/userAliasRepository';
import { findUserByEmail, findUserByLoginId } from '@/repositories/userRepository';
import { convertEntraIdToLegacy } from './domainMapping';

/**
 * NextAuth設定
 */
export const authOptions: NextAuthOptions = {
  providers: [
    // Azure AD (EntraID) Provider
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
    // 既存のCredentials Provider（LDAP + DB認証）
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
            }),
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
    async signIn({ user, account, profile }) {
      // Azure AD認証の場合
      if (account?.provider === 'azure-ad') {
        const entraIdEmail = user.email!;
        
        try {
          // 既存のEntraIDエイリアスを検索
          let userAlias = await findEntraIdUserAlias(entraIdEmail);
          
          if (userAlias) {
            // 既存ユーザーが見つかった場合
            return true;
          }
          
          // 既存ユーザーとのマッピングを試行
          const legacyEmail = convertEntraIdToLegacy(entraIdEmail);
          let existingUser = await findUserByEmail(legacyEmail);
          
          // メールアドレスで見つからない場合、ユーザーキーでも検索
          if (!existingUser) {
            const username = entraIdEmail.split('@')[0];
            existingUser = await findUserByLoginId(username);
          }
          
          if (existingUser) {
            // 既存ユーザーにEntraIDエイリアスを追加
            await createEntraIdUserAlias(
              existingUser.userId,
              entraIdEmail,
              user.name || user.email!
            );
            
            return true;
          }
          
          // 新規ユーザーの場合（後で実装）
          // TODO: 新規ユーザー作成機能
          console.warn('New user registration not yet implemented for EntraID');
          return false;
          
        } catch (error) {
          console.error('EntraID sign-in error:', error);
          return false;
        }
      }
      
      // その他のプロバイダー（Credentials）
      return true;
    },
    async jwt({ token, user, account }) {
      // Azure AD認証の場合
      if (account?.provider === 'azure-ad') {
        const entraIdEmail = token.email!;
        
        try {
          const userAlias = await findEntraIdUserAlias(entraIdEmail);
          if (userAlias) {
            const existingUser = await findUserByLoginId(userAlias.userId.toString());
            if (existingUser) {
              token.userId = existingUser.userId;
              token.userName = existingUser.userName;
              token.role = existingUser.roleFlag === 1 ? 'admin' : 'user';
              token.unreadCount = 0; // TODO: 未読数の実装
            }
          }
        } catch (error) {
          console.error('JWT callback error for EntraID:', error);
        }
      } else if (user) {
        // Credentials認証の場合
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