import { KnowledgeStocksPage } from '../page';

interface PageProps {
  params: Promise<{
    offset: string;
  }>;
  searchParams: Promise<{
    stockid?: string;
  }>;
}

export default async function StocksWithOffsetPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <KnowledgeStocksPage
      searchParams={{
        ...resolvedSearchParams,
        offset: resolvedParams.offset,
      }}
    />
  );
}