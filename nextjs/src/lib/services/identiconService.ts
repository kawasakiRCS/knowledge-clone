/**
 * IdenticonService
 * 
 * @description 旧JavaシステムのIdenticonLogic.javaの完全移植
 * - MD5ハッシュベースのIdenticon生成
 * - 5x5ピクセルパターンの20x20拡大
 * - 水平対称パターン
 * - ユーザーIDから一意の色とパターン生成
 */
import crypto from 'crypto';
import { createCanvas } from 'canvas';

export interface IconData {
  fileName: string;
  contentType: string;
  size: number;
  data: Buffer;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export class IdenticonService {
  /**
   * Identiconを生成
   * 
   * @param userId ユーザーID
   * @returns アイコンデータ
   */
  async generateIdenticon(userId: number): Promise<IconData> {
    // MD5ハッシュ生成
    const hash = this.generateMD5Hash(userId);
    
    // 5x5パターン生成
    const pattern = this.generatePattern(hash);
    
    // 色抽出
    const color = this.extractColor(hash);
    
    // PNG画像生成
    const pngBuffer = await this.generatePNG(pattern, color);
    
    return {
      fileName: `identicon_${userId}.png`,
      contentType: 'image/png',
      size: pngBuffer.length,
      data: pngBuffer
    };
  }

  /**
   * MD5ハッシュ生成
   * 
   * @param userId ユーザーID
   * @returns MD5ハッシュ（32文字のhex string）
   */
  generateMD5Hash(userId: number): string {
    return crypto.createHash('md5').update(userId.toString()).digest('hex');
  }

  /**
   * 5x5パターン生成（水平対称）
   * 
   * @param hash MD5ハッシュ
   * @returns 5x5のboolean配列
   */
  generatePattern(hash: string): boolean[][] {
    const pattern: boolean[][] = Array(5).fill(null).map(() => Array(5).fill(false));
    
    // ハッシュの各ビットを使用してパターンを生成
    const bytes = Buffer.from(hash, 'hex');
    
    let bitIndex = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) { // 左半分+中央のみ生成
        const byteIndex = Math.floor(bitIndex / 8);
        const bitPosition = bitIndex % 8;
        
        if (byteIndex < bytes.length) {
          const bit = (bytes[byteIndex] & (1 << bitPosition)) !== 0;
          pattern[row][col] = bit;
          
          // 水平対称：左右をミラー
          if (col < 2) {
            pattern[row][4 - col] = bit;
          }
        }
        bitIndex++;
      }
    }
    
    return pattern;
  }

  /**
   * MD5ハッシュからRGB色を抽出
   * 
   * @param hash MD5ハッシュ
   * @returns RGB色
   */
  extractColor(hash: string): RGB {
    // 先頭3バイトをRGBとして使用（旧Javaシステムと同様）
    const bytes = Buffer.from(hash.substring(0, 6), 'hex');
    
    return {
      r: bytes[0],
      g: bytes[1],
      b: bytes[2]
    };
  }

  /**
   * PNG画像生成（Canvas使用）
   * 
   * @param pattern 5x5のパターン
   * @param color RGB色
   * @returns PNG画像のBuffer
   */
  private async generatePNG(pattern: boolean[][], color: RGB): Promise<Buffer> {
    const width = 20;
    const height = 20;
    const pixelSize = 4; // 5x5 → 20x20 (4倍拡大)
    
    // Canvas作成
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // 背景色（白）
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // パターン色設定
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    
    // 5x5パターンを20x20に拡大して描画
    for (let patternY = 0; patternY < 5; patternY++) {
      for (let patternX = 0; patternX < 5; patternX++) {
        if (pattern[patternY] && pattern[patternY][patternX]) {
          const x = patternX * pixelSize;
          const y = patternY * pixelSize;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    }
    
    // PNG形式で出力
    return canvas.toBuffer('image/png');
  }
}