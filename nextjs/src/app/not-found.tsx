/**
 * Next.js 404 Not Found ページ
 * 
 * @description 旧システムのnot_found.jsp相当のページ
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
import { ErrorPage } from '@/components/layout';

export default function NotFound() {
  return (
    <ErrorPage 
      statusCode={404}
      message="お探しのページは見つかりませんでした。URLをご確認ください。"
    />
  );
}