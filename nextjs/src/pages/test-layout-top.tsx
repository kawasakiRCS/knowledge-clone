/**
 * LayoutTopLayoutのテストページ
 * 
 * @description トップページレイアウトの動作確認用
 */
import { LayoutTopLayout } from '@/components/layouts';
import { IndexPage } from '@/components/index';
import Head from 'next/head';

export default function TestLayoutTop() {
  return (
    <>
      <Head>
        <title>Test Layout Top</title>
      </Head>
      <LayoutTopLayout
        pageTitle="Knowledge - Free Knowledge Base System"
        headContent={`<link rel="stylesheet" href="/css/top.css" />`}
        scriptsContent={`
          <script type="text/javascript">
          $(document).ready(function() {
            $('#headerwrap').click(function() {
              location.href='/open.knowledge/list';
            });
          });
          </script>
        `}
      >
        <IndexPage />
      </LayoutTopLayout>
    </>
  );
}