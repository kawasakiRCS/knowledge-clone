/**
 * Database connection utility テスト
 * 
 * @description PrismaClient シングルトンインスタンスのテスト
 */

import { PrismaClient } from '@prisma/client';

// PrismaClient をモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    knowledge: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('Database connection utility', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // グローバル変数をクリア
    if (globalThis.prisma) {
      delete globalThis.prisma;
    }
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  describe('development環境', () => {
    beforeEach(() => {
      process.env = { ...originalEnv, NODE_ENV: 'development' };
    });
    
    test('PrismaClientのシングルトンインスタンスが作成される', () => {
      const { prisma } = require('../index');
      
      expect(PrismaClient).toHaveBeenCalledTimes(1);
      expect(prisma).toBeDefined();
      expect(globalThis.prisma).toBe(prisma);
    });
    
    test('2回目のインポートでは同じインスタンスが返される', () => {
      const { prisma: prisma1 } = require('../index');
      
      // モジュールを再読み込み
      jest.resetModules();
      const { prisma: prisma2 } = require('../index');
      
      // 新しいインスタンスは作成されない
      expect(PrismaClient).toHaveBeenCalledTimes(1);
      expect(prisma2).toBe(prisma1);
      expect(globalThis.prisma).toBe(prisma1);
    });
    
    test('グローバル変数に既存のprismaがある場合はそれを使用する', () => {
      const existingPrisma = { existing: true };
      globalThis.prisma = existingPrisma as any;
      
      const { prisma } = require('../index');
      
      // 新しいPrismaClientは作成されない
      expect(PrismaClient).not.toHaveBeenCalled();
      expect(prisma).toBe(existingPrisma);
    });
  });
  
  describe('production環境', () => {
    beforeEach(() => {
      process.env = { ...originalEnv, NODE_ENV: 'production' };
    });
    
    test('PrismaClientのインスタンスが作成される', () => {
      const { prisma } = require('../index');
      
      expect(PrismaClient).toHaveBeenCalledTimes(1);
      expect(prisma).toBeDefined();
      // production環境ではグローバル変数に保存されない
      expect(globalThis.prisma).toBeUndefined();
    });
    
    test('2回目のインポートでも新しいインスタンスが作成される', () => {
      const { prisma: prisma1 } = require('../index');
      
      // モジュールを再読み込み
      jest.resetModules();
      const { prisma: prisma2 } = require('../index');
      
      // production環境では新しいインスタンスが作成される
      expect(PrismaClient).toHaveBeenCalledTimes(2);
      expect(prisma2).not.toBe(prisma1);
      expect(globalThis.prisma).toBeUndefined();
    });
  });
  
  describe('test環境', () => {
    beforeEach(() => {
      process.env = { ...originalEnv, NODE_ENV: 'test' };
    });
    
    test('PrismaClientのインスタンスが作成される', () => {
      const { prisma } = require('../index');
      
      expect(PrismaClient).toHaveBeenCalledTimes(1);
      expect(prisma).toBeDefined();
      // test環境ではグローバル変数に保存されない
      expect(globalThis.prisma).toBeUndefined();
    });
  });
  
  describe('環境変数が未設定の場合', () => {
    beforeEach(() => {
      delete process.env.NODE_ENV;
    });
    
    test('PrismaClientのインスタンスが作成される', () => {
      const { prisma } = require('../index');
      
      expect(PrismaClient).toHaveBeenCalledTimes(1);
      expect(prisma).toBeDefined();
      // NODE_ENVが未設定の場合はグローバル変数に保存されない
      expect(globalThis.prisma).toBeUndefined();
    });
  });

  describe('Prismaメソッドの利用可能性', () => {
    test('基本的なPrismaメソッドが利用可能', () => {
      const { prisma } = require('../index');
      
      // 接続関連メソッド
      expect(prisma.$connect).toBeDefined();
      expect(prisma.$disconnect).toBeDefined();
      expect(prisma.$transaction).toBeDefined();
      expect(prisma.$queryRaw).toBeDefined();
      expect(prisma.$executeRaw).toBeDefined();
      
      // モデル関連メソッド
      expect(prisma.user).toBeDefined();
      expect(prisma.user.findMany).toBeDefined();
      expect(prisma.user.findUnique).toBeDefined();
      expect(prisma.user.create).toBeDefined();
      expect(prisma.user.update).toBeDefined();
      expect(prisma.user.delete).toBeDefined();
      
      expect(prisma.knowledge).toBeDefined();
      expect(prisma.knowledge.findMany).toBeDefined();
      expect(prisma.knowledge.create).toBeDefined();
      
      expect(prisma.tag).toBeDefined();
      expect(prisma.tag.findMany).toBeDefined();
      expect(prisma.tag.create).toBeDefined();
    });
  });

  describe('エクスポート', () => {
    test('prismaが名前付きエクスポートされる', () => {
      const dbModule = require('../index');
      
      expect(dbModule).toHaveProperty('prisma');
      expect(dbModule.prisma).toBeDefined();
      expect(dbModule.prisma.$connect).toBeDefined();
    });

    test('デフォルトエクスポートがない', () => {
      const dbModule = require('../index');
      
      expect(dbModule.default).toBeUndefined();
    });
  });
});