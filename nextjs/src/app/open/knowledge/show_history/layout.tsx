/**
 * 閲覧履歴ページレイアウト
 */
import MainLayout from '@/components/layouts/MainLayout';

export const metadata = {
  title: '履歴 - Knowledge',
  description: 'ナレッジの閲覧履歴を表示します',
};

export default function ShowHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}