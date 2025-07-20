/**
 * ユーティリティ関数エクスポートのテスト
 * 
 * @description index.tsからのエクスポート確認テスト
 */
import { describe, test, expect } from '@jest/globals';
import * as utils from '../index';

describe('Utils index exports', () => {
  test('setCookie関数がエクスポートされている', () => {
    expect(utils.setCookie).toBeDefined();
    expect(typeof utils.setCookie).toBe('function');
  });

  test('getCookies関数がエクスポートされている', () => {
    expect(utils.getCookies).toBeDefined();
    expect(typeof utils.getCookies).toBe('function');
  });

  test('logging関数がエクスポートされている', () => {
    expect(utils.logging).toBeDefined();
    expect(typeof utils.logging).toBe('function');
  });

  test('insertAtCaret関数がエクスポートされている', () => {
    expect(utils.insertAtCaret).toBeDefined();
    expect(typeof utils.insertAtCaret).toBe('function');
  });

  test('isString関数がエクスポートされている', () => {
    expect(utils.isString).toBeDefined();
    expect(typeof utils.isString).toBe('function');
  });

  test('unescapeHTML関数がエクスポートされている', () => {
    expect(utils.unescapeHTML).toBeDefined();
    expect(typeof utils.unescapeHTML).toBe('function');
  });

  test('escapeLink関数がエクスポートされている', () => {
    expect(utils.escapeLink).toBeDefined();
    expect(typeof utils.escapeLink).toBe('function');
  });

  test('handleErrorResponse関数がエクスポートされている', () => {
    expect(utils.handleErrorResponse).toBeDefined();
    expect(typeof utils.handleErrorResponse).toBe('function');
  });

  test('initPageTop関数がエクスポートされている', () => {
    expect(utils.initPageTop).toBeDefined();
    expect(typeof utils.initPageTop).toBe('function');
  });

  test('initResponsiveNav関数がエクスポートされている', () => {
    expect(utils.initResponsiveNav).toBeDefined();
    expect(typeof utils.initResponsiveNav).toBe('function');
  });

  test('initModalScrollbar関数がエクスポートされている', () => {
    expect(utils.initModalScrollbar).toBeDefined();
    expect(typeof utils.initModalScrollbar).toBe('function');
  });

  test('startSessionKeepAlive関数がエクスポートされている', () => {
    expect(utils.startSessionKeepAlive).toBeDefined();
    expect(typeof utils.startSessionKeepAlive).toBe('function');
  });

  test('preventDefaultDragDrop関数がエクスポートされている', () => {
    expect(utils.preventDefaultDragDrop).toBeDefined();
    expect(typeof utils.preventDefaultDragDrop).toBe('function');
  });

  test('initCommonScripts関数がエクスポートされている', () => {
    expect(utils.initCommonScripts).toBeDefined();
    expect(typeof utils.initCommonScripts).toBe('function');
  });

  test('全ての関数が正しくエクスポートされている', () => {
    const expectedExports = [
      'setCookie',
      'getCookies',
      'logging',
      'insertAtCaret',
      'isString',
      'unescapeHTML',
      'escapeLink',
      'handleErrorResponse',
      'initPageTop',
      'initResponsiveNav',
      'initModalScrollbar',
      'startSessionKeepAlive',
      'preventDefaultDragDrop',
      'initCommonScripts',
    ];

    expectedExports.forEach((exportName) => {
      expect(utils).toHaveProperty(exportName);
      expect(typeof (utils as any)[exportName]).toBe('function');
    });
  });
});