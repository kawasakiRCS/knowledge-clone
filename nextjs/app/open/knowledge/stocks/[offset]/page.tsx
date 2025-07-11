import { KnowledgeStocksPage } from '../page';

interface PageProps {
  params: {
    offset: string;
  };
  searchParams: {
    stockid?: string;
  };
}

export default function StocksWithOffsetPage({ params, searchParams }: PageProps) {
  return (
    <KnowledgeStocksPage
      searchParams={{
        ...searchParams,
        offset: params.offset,
      }}
    />
  );
}