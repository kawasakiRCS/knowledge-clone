/**
 * NextAuth APIルート
 * 
 * @description NextAuthの認証エンドポイント
 * 旧システムのJava認証機能をNext.js/NextAuthで再実装
 */
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };