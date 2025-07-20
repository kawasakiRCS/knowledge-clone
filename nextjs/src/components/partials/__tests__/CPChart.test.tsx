/**
 * Contribution Pointチャートコンポーネントのテスト
 * 
 * @description CPChart.tsxの単体テスト
 */

import { render, screen } from '@testing-library/react';
import { CPChart } from '../CPChart';
import { ContributionPointHistory } from '@/types/account';

// dynamic importのモック
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: () => Promise<any>) => {
    // テスト用のモックコンポーネントを返す
    const MockedLine = ({ data, options }: any) => (
      <div data-testid="mocked-chart">
        <div data-testid="chart-data">{JSON.stringify(data)}</div>
        <div data-testid="chart-options">{JSON.stringify(options)}</div>
      </div>
    );
    return MockedLine;
  },
}));

describe('CPChart', () => {
  const mockData: ContributionPointHistory[] = [
    { date: '2024-01-01', point: 100 },
    { date: '2024-01-02', point: 150 },
    { date: '2024-01-03', point: 200 },
    { date: '2024-01-04', point: 180 },
    { date: '2024-01-05', point: 220 },
  ];

  test('データがない場合は「No data」と表示される', () => {
    render(<CPChart data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  test('データがある場合はチャートがレンダリングされる', () => {
    render(<CPChart data={mockData} />);
    expect(screen.getByTestId('mocked-chart')).toBeInTheDocument();
  });

  test('正しいチャートデータが設定される', () => {
    render(<CPChart data={mockData} />);
    
    const chartDataElement = screen.getByTestId('chart-data');
    const chartData = JSON.parse(chartDataElement.textContent || '{}');
    
    // ラベルの確認
    expect(chartData.labels).toEqual([
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
      '2024-01-04',
      '2024-01-05',
    ]);
    
    // データセットの確認
    expect(chartData.datasets).toHaveLength(1);
    expect(chartData.datasets[0].label).toBe('Contribution Points');
    expect(chartData.datasets[0].data).toEqual([100, 150, 200, 180, 220]);
    expect(chartData.datasets[0].borderColor).toBe('rgb(75, 192, 192)');
    expect(chartData.datasets[0].backgroundColor).toBe('rgba(75, 192, 192, 0.5)');
  });

  test('正しいチャートオプションが設定される', () => {
    render(<CPChart data={mockData} />);
    
    const chartOptionsElement = screen.getByTestId('chart-options');
    const chartOptions = JSON.parse(chartOptionsElement.textContent || '{}');
    
    // オプションの確認
    expect(chartOptions.responsive).toBe(true);
    expect(chartOptions.plugins.legend.display).toBe(false);
    expect(chartOptions.plugins.title.display).toBe(false);
    expect(chartOptions.scales.y.beginAtZero).toBe(true);
  });

  test('単一データポイントでも正常に動作する', () => {
    const singleData: ContributionPointHistory[] = [
      { date: '2024-01-01', point: 100 },
    ];
    
    render(<CPChart data={singleData} />);
    
    const chartDataElement = screen.getByTestId('chart-data');
    const chartData = JSON.parse(chartDataElement.textContent || '{}');
    
    expect(chartData.labels).toEqual(['2024-01-01']);
    expect(chartData.datasets[0].data).toEqual([100]);
  });

  test('大量データでも正常に動作する', () => {
    const largeData: ContributionPointHistory[] = Array.from({ length: 100 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      point: Math.floor(Math.random() * 300) + 50,
    }));
    
    render(<CPChart data={largeData} />);
    
    const chartDataElement = screen.getByTestId('chart-data');
    const chartData = JSON.parse(chartDataElement.textContent || '{}');
    
    expect(chartData.labels).toHaveLength(100);
    expect(chartData.datasets[0].data).toHaveLength(100);
  });

  test('ポイントが0の場合も正常に表示される', () => {
    const zeroPointData: ContributionPointHistory[] = [
      { date: '2024-01-01', point: 0 },
      { date: '2024-01-02', point: 50 },
      { date: '2024-01-03', point: 0 },
    ];
    
    render(<CPChart data={zeroPointData} />);
    
    const chartDataElement = screen.getByTestId('chart-data');
    const chartData = JSON.parse(chartDataElement.textContent || '{}');
    
    expect(chartData.datasets[0].data).toEqual([0, 50, 0]);
  });

  test('負のポイントも正常に表示される', () => {
    const negativePointData: ContributionPointHistory[] = [
      { date: '2024-01-01', point: -50 },
      { date: '2024-01-02', point: 100 },
      { date: '2024-01-03', point: -25 },
    ];
    
    render(<CPChart data={negativePointData} />);
    
    const chartDataElement = screen.getByTestId('chart-data');
    const chartData = JSON.parse(chartDataElement.textContent || '{}');
    
    expect(chartData.datasets[0].data).toEqual([-50, 100, -25]);
  });

  test('データが更新された場合、チャートも更新される', () => {
    const initialData: ContributionPointHistory[] = [
      { date: '2024-01-01', point: 100 },
    ];
    
    const { rerender } = render(<CPChart data={initialData} />);
    
    const chartDataElement1 = screen.getByTestId('chart-data');
    const chartData1 = JSON.parse(chartDataElement1.textContent || '{}');
    expect(chartData1.datasets[0].data).toEqual([100]);
    
    const updatedData: ContributionPointHistory[] = [
      { date: '2024-01-01', point: 100 },
      { date: '2024-01-02', point: 200 },
    ];
    
    rerender(<CPChart data={updatedData} />);
    
    const chartDataElement2 = screen.getByTestId('chart-data');
    const chartData2 = JSON.parse(chartDataElement2.textContent || '{}');
    expect(chartData2.datasets[0].data).toEqual([100, 200]);
  });

  test('空データから有効データへの変更時に正しく表示される', () => {
    const { rerender } = render(<CPChart data={[]} />);
    
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-chart')).not.toBeInTheDocument();
    
    const newData: ContributionPointHistory[] = [
      { date: '2024-01-01', point: 100 },
    ];
    
    rerender(<CPChart data={newData} />);
    
    expect(screen.queryByText('No data')).not.toBeInTheDocument();
    expect(screen.getByTestId('mocked-chart')).toBeInTheDocument();
  });

  test('有効データから空データへの変更時に正しく表示される', () => {
    const initialData: ContributionPointHistory[] = [
      { date: '2024-01-01', point: 100 },
    ];
    
    const { rerender } = render(<CPChart data={initialData} />);
    
    expect(screen.getByTestId('mocked-chart')).toBeInTheDocument();
    expect(screen.queryByText('No data')).not.toBeInTheDocument();
    
    rerender(<CPChart data={[]} />);
    
    expect(screen.queryByTestId('mocked-chart')).not.toBeInTheDocument();
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  test('日付が不正な形式でもクラッシュしない', () => {
    const invalidDateData: ContributionPointHistory[] = [
      { date: '', point: 100 },
      { date: 'invalid-date', point: 150 },
      { date: '2024/01/03', point: 200 },
    ];
    
    render(<CPChart data={invalidDateData} />);
    
    const chartDataElement = screen.getByTestId('chart-data');
    const chartData = JSON.parse(chartDataElement.textContent || '{}');
    
    expect(chartData.labels).toEqual(['', 'invalid-date', '2024/01/03']);
    expect(chartData.datasets[0].data).toEqual([100, 150, 200]);
  });

  test('非常に大きなポイント値でも正常に動作する', () => {
    const largePointData: ContributionPointHistory[] = [
      { date: '2024-01-01', point: Number.MAX_SAFE_INTEGER },
      { date: '2024-01-02', point: 0 },
      { date: '2024-01-03', point: -Number.MAX_SAFE_INTEGER },
    ];
    
    render(<CPChart data={largePointData} />);
    
    const chartDataElement = screen.getByTestId('chart-data');
    const chartData = JSON.parse(chartDataElement.textContent || '{}');
    
    expect(chartData.datasets[0].data).toEqual([
      Number.MAX_SAFE_INTEGER,
      0,
      -Number.MAX_SAFE_INTEGER,
    ]);
  });
});