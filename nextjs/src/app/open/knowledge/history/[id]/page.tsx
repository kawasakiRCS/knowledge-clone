import { notFound } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import KnowledgeHistory from '@/components/knowledge/KnowledgeHistory';
import ErrorPage from '@/components/error/ErrorPage';
import ForbiddenPage from '@/components/error/ForbiddenPage';
import Script from 'next/script';

/**
 * ナレッジ履歴詳細ページのパラメータ
 */
interface PageParams {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    history_no?: string;
    page?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

/**
 * ナレッジ履歴詳細ページ
 * 
 * @description 特定の履歴バージョンの詳細と現在との差分を表示
 */
export default async function KnowledgeHistoryPage({ params, searchParams }: PageParams) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const knowledgeId = resolvedParams.id;
  const historyNo = resolvedSearchParams.history_no || '0';
  const page = parseInt(resolvedSearchParams.page as string || '0', 10);

  // その他のパラメータを構築
  const otherParams = Object.entries(resolvedSearchParams)
    .filter(([key]) => key !== 'history_no' && key !== 'page')
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value[0] : value}`)
    .join('&');
  const paramsString = otherParams ? `?${otherParams}` : '';

  try {
    // 履歴データの取得
    const historyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/api/knowledge/history/${knowledgeId}?history_no=${historyNo}`,
      { cache: 'no-store' }
    );

    if (!historyResponse.ok) {
      if (historyResponse.status === 404) {
        notFound();
      }
      if (historyResponse.status === 403) {
        return (
          <MainLayout>
            <ForbiddenPage />
          </MainLayout>
        );
      }
      throw new Error('Failed to fetch history');
    }

    const history = await historyResponse.json();

    // 現在のナレッジデータの取得
    const currentResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/api/knowledge/${knowledgeId}`,
      { cache: 'no-store' }
    );

    if (!currentResponse.ok) {
      throw new Error('Failed to fetch current knowledge');
    }

    const current = await currentResponse.json();

    return (
      <MainLayout
        pageTitle="編集履歴詳細"
      >
        <KnowledgeHistory
          history={history}
          current={current}
          page={page}
          params={paramsString}
        />
      </MainLayout>
    );
  } catch (error) {
    console.error('Error fetching history:', error);
    return (
      <MainLayout>
        <ErrorPage statusCode={500} />
      </MainLayout>
    );
  }
}