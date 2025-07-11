/**
 * Contribution Pointチャートコンポーネント
 */
import React from 'react';
import dynamic from 'next/dynamic';
import { ContributionPointHistory } from '@/types/account';

const DynamicChart = dynamic(
  () => import('react-chartjs-2').then((mod) => {
    // Chart.jsの設定
    import('chart.js').then((ChartJS) => {
      ChartJS.Chart.register(
        ChartJS.CategoryScale,
        ChartJS.LinearScale,
        ChartJS.PointElement,
        ChartJS.LineElement,
        ChartJS.Title,
        ChartJS.Tooltip,
        ChartJS.Legend
      );
    });
    return mod.Line;
  }),
  { ssr: false }
);

interface CPChartProps {
  data: ContributionPointHistory[];
}

export const CPChart: React.FC<CPChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Contribution Points',
        data: data.map(item => item.point),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (data.length === 0) {
    return <div>No data</div>;
  }

  return <DynamicChart data={chartData} options={chartOptions} />;
};