import MainLayout from '@/components/layout/MainLayout';

/**
 * 保護されたページ共通レイアウト
 * 
 * @description /protect配下のすべてのページで共通のMainLayoutを適用
 * @description 認証チェックはmiddleware.tsで実行済み
 */
export default function ProtectedLayout({
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