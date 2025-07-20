/**
 * FileUploadコンポーネントテスト
 * 
 * @description ドラッグ&ドロップ、ファイル選択、アップロード機能のテスト
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from '../FileUpload';

// fetchモック
global.fetch = jest.fn();

describe('FileUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('基本レンダリング', () => {
    test('コンポーネントが正しくレンダリングされる', () => {
      render(<FileUpload />);
      
      expect(screen.getByText(/ファイルをここにドラッグするか/)).toBeInTheDocument();
      expect(screen.getByText(/最大サイズ: 5 MB/)).toBeInTheDocument();
    });

    test('disabled時は適切なスタイルが適用される', () => {
      const { container } = render(<FileUpload disabled={true} />);
      
      const dropZone = container.querySelector('.drop-zone');
      expect(dropZone).toHaveClass('disabled');
    });

    test('カスタム最大ファイルサイズが表示される', () => {
      render(<FileUpload maxFileSize={10 * 1024 * 1024} />);
      
      expect(screen.getByText(/最大サイズ: 10 MB/)).toBeInTheDocument();
    });
  });

  describe('既存ファイル表示', () => {
    const existingFiles = [
      { fileNo: 1, fileName: 'test1.pdf', fileSize: 1024 },
      { fileNo: 2, fileName: 'test2.docx', fileSize: 2048 },
    ];

    test('既存ファイルが正しく表示される', () => {
      render(<FileUpload existingFiles={existingFiles} />);
      
      expect(screen.getByText('既存ファイル')).toBeInTheDocument();
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
      expect(screen.getByText('test2.docx')).toBeInTheDocument();
      expect(screen.getByText('(1 KB)')).toBeInTheDocument();
      expect(screen.getByText('(2 KB)')).toBeInTheDocument();
    });

    test('既存ファイルの削除ボタンが動作する', () => {
      const onFileRemoved = jest.fn();
      render(<FileUpload existingFiles={existingFiles} onFileRemoved={onFileRemoved} />);
      
      const deleteButtons = screen.getAllByRole('button');
      fireEvent.click(deleteButtons[0]);
      
      expect(onFileRemoved).toHaveBeenCalledWith(1);
    });

    test('disabled時は削除ボタンが表示されない', () => {
      render(<FileUpload existingFiles={existingFiles} disabled={true} />);
      
      const deleteButtons = screen.queryAllByRole('button');
      expect(deleteButtons).toHaveLength(0);
    });
  });

  describe('ファイル選択', () => {
    test('ファイル選択でアップロードが開始される', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fileNo: 123, fileName: 'test.pdf', fileSize: 1024 }),
      });

      const onFileUploaded = jest.fn();
      const { container } = render(<FileUpload onFileUploaded={onFileUploaded} allowedTypes={['.pdf', 'application/pdf']} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/protect/files', {
          method: 'POST',
          body: expect.any(FormData),
        });
      });

      await waitFor(() => {
        expect(onFileUploaded).toHaveBeenCalledWith({
          fileNo: 123,
          fileName: 'test.pdf',
          fileSize: 1024,
        });
      });
    });

    test('複数ファイル選択が動作する', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ fileNo: 123, fileName: 'test1.pdf', fileSize: 1024 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ fileNo: 124, fileName: 'test2.pdf', fileSize: 2048 }),
        });

      const { container } = render(<FileUpload multiple={true} allowedTypes={['.pdf', 'application/pdf']} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const files = [
        new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'test2.pdf', { type: 'application/pdf' }),
      ];
      
      fireEvent.change(input, { target: { files } });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    test('disabled時はファイル選択が無効', () => {
      const { container } = render(<FileUpload disabled={true} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe('ドラッグ&ドロップ', () => {
    test('ドラッグオーバーでスタイルが変更される', () => {
      const { container } = render(<FileUpload />);
      const dropZone = container.querySelector('.drop-zone') as HTMLElement;
      
      fireEvent.dragOver(dropZone);
      expect(dropZone).toHaveClass('drag-over');
      
      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('drag-over');
    });

    test('ファイルドロップでアップロードが開始される', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fileNo: 123, fileName: 'dropped.pdf', fileSize: 1024 }),
      });

      const onFileUploaded = jest.fn();
      const { container } = render(<FileUpload onFileUploaded={onFileUploaded} allowedTypes={['.pdf', 'application/pdf']} />);
      const dropZone = container.querySelector('.drop-zone') as HTMLElement;
      
      const file = new File(['dropped content'], 'dropped.pdf', { type: 'application/pdf' });
      const dataTransfer = {
        files: [file],
        items: [{ kind: 'file', type: 'application/pdf', getAsFile: () => file }],
        types: ['Files'],
      };
      
      fireEvent.drop(dropZone, { dataTransfer });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onFileUploaded).toHaveBeenCalledWith({
          fileNo: 123,
          fileName: 'dropped.pdf',
          fileSize: 1024,
        });
      });
    });

    test('disabled時はドロップが無効', () => {
      const { container } = render(<FileUpload disabled={true} />);
      const dropZone = container.querySelector('.drop-zone') as HTMLElement;
      
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const dataTransfer = {
        files: [file],
        items: [{ kind: 'file', type: 'application/pdf', getAsFile: () => file }],
        types: ['Files'],
      };
      
      fireEvent.drop(dropZone, { dataTransfer });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('ファイルバリデーション', () => {
    test('ファイルサイズ制限が適用される', async () => {
      const { container } = render(<FileUpload maxFileSize={1024} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const largeFile = new File(['x'.repeat(2048)], 'large.pdf', { type: 'application/pdf' });
      
      fireEvent.change(input, { target: { files: [largeFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/ファイルサイズが制限を超えています/)).toBeInTheDocument();
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('許可されたファイルタイプのみ受け付ける', async () => {
      const { container } = render(<FileUpload allowedTypes={['.pdf']} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      fireEvent.change(input, { target: { files: [invalidFile] } });
      
      await waitFor(() => {
        expect(screen.getByText('サポートされていないファイル形式です')).toBeInTheDocument();
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('ワイルドカード形式のファイルタイプが動作する', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fileNo: 123, fileName: 'image.png', fileSize: 1024 }),
      });

      const { container } = render(<FileUpload allowedTypes={['image/*']} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const imageFile = new File(['image'], 'image.png', { type: 'image/png' });
      
      fireEvent.change(input, { target: { files: [imageFile] } });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('アップロード処理', () => {
    test('アップロード中の進捗が表示される', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ fileNo: 123, fileName: 'test.pdf', fileSize: 1024 }),
        }), 100))
      );

      const { container } = render(<FileUpload allowedTypes={['.pdf', 'application/pdf']} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('アップロード中・完了')).toBeInTheDocument();
        expect(container.querySelector('.progress')).toBeInTheDocument();
      });
    });

    test('アップロード完了時の表示', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fileNo: 123, fileName: 'test.pdf', fileSize: 1024 }),
      });

      const { container } = render(<FileUpload allowedTypes={['.pdf', 'application/pdf']} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('完了')).toBeInTheDocument();
        expect(container.querySelector('.fa-check')).toBeInTheDocument();
      });
    });

    test('アップロードエラー時の表示', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { container } = render(<FileUpload allowedTypes={['.pdf', 'application/pdf']} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(container.querySelector('.fa-exclamation-triangle')).toBeInTheDocument();
      });
    });

    test('サーバーエラーレスポンスの処理', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'ファイルが大きすぎます' }),
      });

      const { container } = render(<FileUpload allowedTypes={['.pdf', 'application/pdf']} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('ファイルが大きすぎます')).toBeInTheDocument();
      });
    });
  });

  describe('ファイル削除', () => {
    test('アップロード完了ファイルの削除', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fileNo: 123, fileName: 'test.pdf', fileSize: 1024 }),
      });

      const onFileRemoved = jest.fn();
      const { container } = render(<FileUpload onFileRemoved={onFileRemoved} allowedTypes={['.pdf', 'application/pdf']} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('完了')).toBeInTheDocument();
      });
      
      const deleteButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('.fa-trash')
      );
      fireEvent.click(deleteButton!);
      
      expect(onFileRemoved).toHaveBeenCalledWith(123);
      await waitFor(() => {
        expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
      });
    });

    test('エラーファイルの削除', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { container } = render(<FileUpload allowedTypes={['.pdf', 'application/pdf']} />);
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
      
      const deleteButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('.fa-trash')
      );
      fireEvent.click(deleteButton!);
      
      await waitFor(() => {
        expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
      });
    });
  });

  describe('ファイルサイズフォーマット', () => {
    test('各単位のファイルサイズが正しくフォーマットされる', () => {
      const files = [
        { fileNo: 1, fileName: 'bytes.txt', fileSize: 0 },
        { fileNo: 2, fileName: 'kb.txt', fileSize: 1536 },
        { fileNo: 3, fileName: 'mb.txt', fileSize: 5242880 },
        { fileNo: 4, fileName: 'gb.txt', fileSize: 1073741824 },
      ];
      
      render(<FileUpload existingFiles={files} />);
      
      expect(screen.getByText('(0 Bytes)')).toBeInTheDocument();
      expect(screen.getByText('(1.5 KB)')).toBeInTheDocument();
      expect(screen.getByText('(5 MB)')).toBeInTheDocument();
      expect(screen.getByText('(1 GB)')).toBeInTheDocument();
    });
  });

  describe('クリックでファイル選択', () => {
    test('ドロップゾーンクリックでファイル選択ダイアログが開く', () => {
      const { container } = render(<FileUpload />);
      const dropZone = container.querySelector('.drop-zone') as HTMLElement;
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      
      const clickSpy = jest.spyOn(input, 'click');
      
      fireEvent.click(dropZone);
      
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});