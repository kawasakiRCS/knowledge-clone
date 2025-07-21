/**
 * Database connection utility テスト
 * 
 * @description PrismaClient シングルトンインスタンスのテスト
 */
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

describe('Database connection utility', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the global prisma instance
    delete (global as any).prisma;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('開発環境でグローバルインスタンスを設定', () => {
    process.env.NODE_ENV = 'development';
    
    // Clear module cache to force re-import
    jest.resetModules();
    
    const { prisma } = require('../index');
    
    expect(prisma).toBeDefined();
    expect((global as any).prisma).toBe(prisma);
    expect(PrismaClient).toHaveBeenCalledTimes(1);
  });

  test('本番環境でグローバルインスタンスを設定しない', () => {
    process.env.NODE_ENV = 'production';
    
    // Clear module cache to force re-import
    jest.resetModules();
    
    const { prisma } = require('../index');
    
    expect(prisma).toBeDefined();
    expect((global as any).prisma).toBeUndefined();
    expect(PrismaClient).toHaveBeenCalledTimes(1);
  });

  test('既存のグローバルインスタンスを再利用', () => {
    const mockPrismaInstance = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    };
    (global as any).prisma = mockPrismaInstance;
    
    // Clear module cache to force re-import
    jest.resetModules();
    
    const { prisma } = require('../index');
    
    expect(prisma).toBe(mockPrismaInstance);
    expect(PrismaClient).not.toHaveBeenCalled();
  });

  test('PrismaClientインスタンスがシングルトン', () => {
    process.env.NODE_ENV = 'development';
    
    // Clear module cache to force re-import
    jest.resetModules();
    
    const module1 = require('../index');
    const module2 = require('../index');
    
    expect(module1.prisma).toBe(module2.prisma);
    expect(PrismaClient).toHaveBeenCalledTimes(1);
  });
});