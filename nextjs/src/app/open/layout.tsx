import MainLayout from '@/components/layout/MainLayout';

/**
 * 公開ページ共通レイアウト
 * 
 * @description /open配下のすべてのページで共通のMainLayoutを適用
 */
export default function OpenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}