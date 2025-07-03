<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Web\User;
use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\TemplateMaster;
use App\Models\Knowledge\Tag;
use App\Models\Knowledge\Comment;

class KnowledgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 管理者ユーザー作成
        $admin = User::firstOrCreate(
            ['user_key' => 'admin'],
            [
                'user_name' => '管理者',
                'mail_address' => 'admin@example.com',
                'password' => bcrypt('password'),
                'auth_ldap' => 0,
                'locale_key' => 'ja',
            ]
        );

        // 一般ユーザー作成
        $user1 = User::firstOrCreate(
            ['user_key' => 'user1'],
            [
                'user_name' => '田中太郎',
                'mail_address' => 'tanaka@example.com',
                'password' => bcrypt('password'),
                'auth_ldap' => 0,
                'locale_key' => 'ja',
            ]
        );

        $user2 = User::firstOrCreate(
            ['user_key' => 'user2'],
            [
                'user_name' => '佐藤花子',
                'mail_address' => 'sato@example.com',
                'password' => bcrypt('password'),
                'auth_ldap' => 0,
                'locale_key' => 'ja',
            ]
        );

        // テンプレート作成
        $templates = [
            [
                'type_name' => '技術ドキュメント',
                'type_icon' => '📚',
                'description' => '技術的な内容のドキュメント',
            ],
            [
                'type_name' => 'FAQ',
                'type_icon' => '❓',
                'description' => 'よくある質問と回答',
            ],
            [
                'type_name' => '手順書',
                'type_icon' => '📋',
                'description' => '作業手順を説明するドキュメント',
            ],
            [
                'type_name' => 'トラブルシューティング',
                'type_icon' => '🔧',
                'description' => '問題解決に関するドキュメント',
            ],
            [
                'type_name' => 'ナレッジ共有',
                'type_icon' => '💡',
                'description' => 'チーム内での知識共有',
            ],
        ];

        $templateObjects = [];
        foreach ($templates as $template) {
            $templateObjects[] = TemplateMaster::firstOrCreate(
                ['type_name' => $template['type_name']],
                [
                    'type_icon' => $template['type_icon'],
                    'description' => $template['description'],
                    'insert_user' => $admin->user_id,
                    'update_user' => $admin->user_id,
                ]
            );
        }

        // タグ作成
        $tags = ['Laravel', 'PHP', 'Vue.js', 'Docker', 'PostgreSQL', 'JavaScript', 'TypeScript', 'API', 'フロントエンド', 'バックエンド'];
        $tagObjects = [];
        foreach ($tags as $tagName) {
            $tagObjects[] = Tag::firstOrCreate(
                ['tag_name' => $tagName],
                [
                    'insert_user' => $admin->user_id,
                    'update_user' => $admin->user_id,
                ]
            );
        }

        // サンプルナレッジ作成
        $knowledges = [
            [
                'title' => 'Laravel環境構築ガイド',
                'content' => "# Laravel環境構築ガイド\n\nこのドキュメントではLaravelの環境構築について詳しく説明します。\n\n## 前提条件\n\n- Docker Desktop\n- Git\n- Visual Studio Code (推奨)\n\n## セットアップ手順\n\n### 1. プロジェクトのクローン\n\n```bash\ngit clone <repository-url>\ncd knowledge-laravel\n```\n\n### 2. 環境設定\n\n```bash\ncp .env.example .env\n```\n\n### 3. コンテナ起動\n\n```bash\n./vendor/bin/sail up -d\n```\n\n## トラブルシューティング\n\nポート競合が発生した場合は、以下のコマンドで確認してください：\n\n```bash\nsudo lsof -i :80\n```",
                'public_flag' => 1,
                'type_id' => $templateObjects[0]->type_id,
                'anonymous' => 0,
                'user' => $admin,
                'tags' => ['Laravel', 'Docker', 'PHP'],
            ],
            [
                'title' => 'Vue.js 3 Composition API チートシート',
                'content' => "# Vue.js 3 Composition API チートシート\n\n## setup関数\n\n```javascript\n<script setup>\nimport { ref, reactive, computed, onMounted } from 'vue'\n\n// リアクティブな値\nconst count = ref(0)\n\n// リアクティブなオブジェクト\nconst state = reactive({\n  name: '',\n  email: ''\n})\n\n// 算出プロパティ\nconst doubleCount = computed(() => count.value * 2)\n\n// ライフサイクルフック\nonMounted(() => {\n  console.log('mounted')\n})\n</script>\n```\n\n## TypeScript対応\n\n```typescript\ninterface User {\n  id: number\n  name: string\n}\n\nconst user = ref<User | null>(null)\n```",
                'public_flag' => 1,
                'type_id' => $templateObjects[0]->type_id,
                'anonymous' => 0,
                'user' => $user1,
                'tags' => ['Vue.js', 'JavaScript', 'TypeScript', 'フロントエンド'],
            ],
            [
                'title' => 'PostgreSQL よくある質問',
                'content' => "# PostgreSQL よくある質問\n\n## Q: データベースに接続できません\n\n**A:** 以下の点を確認してください：\n\n1. PostgreSQLサーバーが起動しているか\n2. 接続情報（ホスト、ポート、ユーザー名、パスワード）が正しいか\n3. ファイアウォールの設定\n\n```bash\n# PostgreSQL状態確認\nsudo systemctl status postgresql\n\n# ポート確認\nsudo lsof -i :5432\n```\n\n## Q: パフォーマンスが悪いです\n\n**A:** 以下を確認してください：\n\n1. インデックスが適切に設定されているか\n2. `EXPLAIN ANALYZE`でクエリプランを確認\n3. `postgresql.conf`の設定見直し\n\n```sql\n-- 実行計画の確認\nEXPLAIN ANALYZE SELECT * FROM knowledges WHERE title LIKE '%Laravel%';\n```",
                'public_flag' => 1,
                'type_id' => $templateObjects[1]->type_id,
                'anonymous' => 0,
                'user' => $user2,
                'tags' => ['PostgreSQL', 'データベース', 'トラブルシューティング'],
            ],
            [
                'title' => 'API設計のベストプラクティス',
                'content' => "# API設計のベストプラクティス\n\n## RESTful API設計原則\n\n### 1. リソース指向設計\n\n```\nGET    /api/knowledge        # 一覧取得\nGET    /api/knowledge/1      # 詳細取得\nPOST   /api/knowledge        # 新規作成\nPUT    /api/knowledge/1      # 更新\nDELETE /api/knowledge/1      # 削除\n```\n\n### 2. HTTPステータスコードの適切な使用\n\n- `200 OK`: 成功\n- `201 Created`: 作成成功\n- `400 Bad Request`: リクエストエラー\n- `401 Unauthorized`: 認証エラー\n- `403 Forbidden`: 権限エラー\n- `404 Not Found`: リソースが見つからない\n- `500 Internal Server Error`: サーバーエラー\n\n### 3. レスポンス形式の統一\n\n```json\n{\n  \"success\": true,\n  \"data\": {\n    \"knowledge_id\": 1,\n    \"title\": \"サンプル\"\n  },\n  \"message\": \"取得に成功しました\"\n}\n```",
                'public_flag' => 1,
                'type_id' => $templateObjects[0]->type_id,
                'anonymous' => 0,
                'user' => $admin,
                'tags' => ['API', '設計', 'REST', 'バックエンド'],
            ],
            [
                'title' => 'デプロイ手順書',
                'content' => "# 本番環境デプロイ手順書\n\n## 事前準備\n\n### 1. 環境変数の設定\n\n```env\nAPP_ENV=production\nAPP_DEBUG=false\nAPP_KEY=<32文字のランダム文字列>\nAPP_URL=https://yourdomain.com\n```\n\n### 2. データベースの準備\n\n```bash\n# マイグレーション実行\nphp artisan migrate --force\n\n# 本番用シーダー実行\nphp artisan db:seed --class=ProductionSeeder\n```\n\n## デプロイ手順\n\n### 1. ソースコードのデプロイ\n\n```bash\n# Gitからプル\ngit pull origin main\n\n# 依存関係更新\ncomposer install --no-dev --optimize-autoloader\n\n# フロントエンドビルド\nnpm ci\nnpm run build\n```\n\n### 2. 設定更新\n\n```bash\n# 設定キャッシュ\nphp artisan config:cache\n\n# ルートキャッシュ\nphp artisan route:cache\n\n# ビューキャッシュ\nphp artisan view:cache\n```\n\n### 3. 動作確認\n\n- アプリケーションの動作確認\n- データベース接続確認\n- 検索機能確認",
                'public_flag' => 2, // 保護
                'type_id' => $templateObjects[2]->type_id,
                'anonymous' => 0,
                'user' => $admin,
                'tags' => ['デプロイ', '本番環境', '運用'],
            ],
        ];

        foreach ($knowledges as $knowledgeData) {
            $knowledge = Knowledge::firstOrCreate(
                ['title' => $knowledgeData['title']],
                [
                    'content' => $knowledgeData['content'],
                    'public_flag' => $knowledgeData['public_flag'],
                    'type_id' => $knowledgeData['type_id'],
                    'anonymous' => $knowledgeData['anonymous'],
                    'notify_status' => 0,
                    'point' => 0,
                    'insert_user' => $knowledgeData['user']->user_id,
                    'update_user' => $knowledgeData['user']->user_id,
                ]
            );

            // タグの関連付け（実際の実装では中間テーブルを使用）
            // ここでは簡単のためtag_idsフィールドに文字列として保存
            if (isset($knowledgeData['tags'])) {
                $tagIds = [];
                foreach ($knowledgeData['tags'] as $tagName) {
                    $tag = collect($tagObjects)->firstWhere('tag_name', $tagName);
                    if ($tag) {
                        $tagIds[] = $tag->tag_id;
                    }
                }
                $knowledge->update([
                    'tag_ids' => implode(',', $tagIds),
                    'tag_names' => implode(',', $knowledgeData['tags']),
                ]);
            }
        }

        // サンプルコメント作成
        $knowledges = Knowledge::all();
        foreach ($knowledges->take(3) as $knowledge) {
            Comment::create([
                'knowledge_id' => $knowledge->knowledge_id,
                'comment' => 'とても参考になりました！ありがとうございます。',
                'comment_status' => 0,
                'anonymous' => 0,
                'insert_user' => $user1->user_id,
                'update_user' => $user1->user_id,
            ]);

            Comment::create([
                'knowledge_id' => $knowledge->knowledge_id,
                'comment' => '追加で質問があります。この設定で問題が発生した場合の対処法はありますか？',
                'comment_status' => 0,
                'anonymous' => 0,
                'insert_user' => $user2->user_id,
                'update_user' => $user2->user_id,
            ]);
        }

        $this->command->info('Sample knowledge data has been created successfully!');
        $this->command->info('');
        $this->command->info('Login credentials:');
        $this->command->info('Admin: admin / password');
        $this->command->info('User1: user1 / password');
        $this->command->info('User2: user2 / password');
    }
}