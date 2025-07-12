/**
 * アカウント情報ページ
 * 
 * @description 旧システムのopen/account/account.jspに対応
 */
import { GetServerSideProps } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { AccountPage } from '@/components/AccountPage';

interface AccountInfoPageProps {
  userId: number;
  offset: number;
}

export default function AccountInfoPage({ userId, offset }: AccountInfoPageProps) {
  return (
    <MainLayout>
      <AccountPage userId={userId} offset={offset} />
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps<AccountInfoPageProps> = async (context) => {
  const { userId } = context.params!;
  const { offset = '0' } = context.query;
  
  return {
    props: {
      userId: parseInt(userId as string, 10),
      offset: parseInt(offset as string, 10),
    },
  };
};