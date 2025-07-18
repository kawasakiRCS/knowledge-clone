/**
 * NextAuth型拡張
 * 
 * @description NextAuthのセッション・JWTトークン構造をカスタマイズ
 */
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userId: number;
      userName: string;
      role: string;
      unreadCount: number;
    };
  }

  interface User {
    userId: number;
    userName: string;
    role: string;
    unreadCount: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: number;
    userName?: string;
    role?: string;
    unreadCount?: number;
  }
}