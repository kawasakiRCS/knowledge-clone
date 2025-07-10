# ナレッジベースシステム 移植分析レポート

## 📋 概要
- **旧システム**: Java (Spring + JSP) + PostgreSQL
- **新システム**: Next.js + TypeScript + PostgreSQL
- **移植範囲**: 78テーブル、約100+のJSPページ、認証・ナレッジ管理機能

## 🗄️ データベース構造分析

### 主要テーブル群 (78テーブル)

#### 1. コアナレッジ関連
- `knowledges` - ナレッジ本体
- `knowledge_files` - 添付ファイル
- `knowledge_tags` - タグ紐付け
- `knowledge_groups` - グループ紐付け
- `knowledge_users` - ユーザー紐付け
- `knowledge_edit_groups` - 編集権限グループ
- `knowledge_edit_users` - 編集権限ユーザー
- `knowledge_histories` - 編集履歴
- `knowledge_item_values` - テンプレート項目値

#### 2. ユーザー・認証関連
- `users` - ユーザー情報
- `user_groups` - ユーザーグループ紐付け
- `user_roles` - ユーザー役割
- `user_configs` - ユーザー設定
- `user_badges` - ユーザーバッジ
- `user_notifications` - ユーザー通知設定
- `account_images` - アカウント画像
- `login_histories` - ログイン履歴
- `password_resets` - パスワードリセット
- `provisional_registrations` - 仮登録

#### 3. グループ・権限関連
- `groups` - グループ情報
- `roles` - 役割定義
- `role_functions` - 役割機能紐付け
- `functions` - 機能定義

#### 4. ソーシャル機能
- `likes` - いいね
- `comments` - コメント
- `like_comments` - コメントいいね
- `stocks` - ストック機能
- `stock_knowledges` - ストックナレッジ
- `pins` - ピン留め
- `votes` - 投票

#### 5. 通知・メール関連
- `notifications` - 通知
- `notification_status` - 通知ステータス
- `notify_configs` - 通知設定
- `notify_queues` - 通知キュー
- `mail_configs` - メール設定
- `mail_templates` - メールテンプレート
- `mail_locale_templates` - メールローカライズテンプレート
- `mail_hooks` - メールフック
- `mail_hook_conditions` - メールフック条件
- `mail_hook_ignore_conditions` - メールフック除外条件
- `mail_posts` - メール投稿
- `mail_properties` - メール属性
- `mails` - メール

#### 6. イベント・アクティビティ関連
- `events` - イベント
- `participants` - 参加者
- `activities` - アクティビティ
- `view_histories` - 閲覧履歴

#### 7. アンケート・調査関連
- `surveys` - アンケート
- `survey_items` - アンケート項目
- `survey_choices` - 選択肢
- `survey_answers` - 回答
- `survey_item_answers` - 項目回答

#### 8. テンプレート・フォーム関連
- `template_masters` - テンプレートマスター
- `template_items` - テンプレート項目
- `item_choices` - 項目選択肢
- `draft_knowledges` - 下書きナレッジ
- `draft_item_values` - 下書き項目値

#### 9. システム・設定関連
- `system_configs` - システム設定
- `service_configs` - サービス設定
- `service_locale_configs` - サービスローカライズ設定
- `systems` - システム情報
- `system_attributes` - システム属性
- `locales` - ロケール
- `hash_configs` - ハッシュ設定
- `ldap_configs` - LDAP設定
- `proxy_configs` - プロキシ設定

#### 10. タグ・分類関連
- `tags` - タグ
- `badges` - バッジ

#### 11. ポイント・統計関連
- `point_knowledge_histories` - ナレッジポイント履歴
- `point_user_histories` - ユーザーポイント履歴

#### 12. 外部連携関連
- `webhooks` - Webhook
- `webhook_configs` - Webhook設定
- `tokens` - トークン

#### 13. その他
- `notices` - お知らせ
- `access_logs` - アクセスログ
- `read_marks` - 既読マーク
- `user_alias` - ユーザー別名
- `confirm_mail_changes` - メール変更確認

## 🎯 機能分析（コントローラー別）

### A. 公開機能（`open/`）
1. **アカウント管理** (`AccountControl.java`)
   - ユーザープロフィール表示
   - アカウント情報編集

2. **ナレッジ閲覧** (`KnowledgeControl.java`)
   - ナレッジ一覧・検索
   - ナレッジ詳細表示
   - 人気ナレッジ
   - ナレッジ履歴
   - いいね一覧
   - ストック一覧

3. **認証** 
   - ログイン・ログアウト
   - サインアップ (`SignupControl.java`)
   - パスワード初期化 (`PasswordInitializationControl.java`)

4. **その他公開機能**
   - タグ一覧 (`TagControl.java`)
   - イベント (`EventControl.java`)
   - ファイルダウンロード (`FileControl.java`)
   - 言語切替 (`LanguageControl.java`)
   - ライセンス表示 (`LicenseControl.java`)
   - テーマ切替 (`ThemaControl.java`)
   - 絵文字 (`EmojiControl.java`)
   - アンケート (`SurveyControl.java`)
   - お知らせ (`NoticeControl.java`)

### B. 保護機能（`protect/`）
1. **ナレッジ管理** (`KnowledgeControl.java`)
   - ナレッジ作成・編集・削除
   - マークダウンプレビュー
   - コメント編集

2. **アカウント管理** (`AccountControl.java`)
   - パスワード変更
   - 設定変更
   - 退会処理
   - 通知対象設定

3. **グループ管理** (`GroupControl.java`)
   - グループ作成・編集
   - グループ一覧
   - 所属グループ管理

4. **ストック機能** (`StockControl.java`)
   - ストック追加・削除・編集
   - ストック一覧・ナレッジ一覧

5. **下書き機能** (`DraftControl.java`)
   - 下書き一覧・管理

6. **通知機能** (`NotificationControl.java`)
   - 通知一覧・詳細・既読処理

7. **その他保護機能**
   - イベント管理 (`EventControl.java`)
   - ファイル管理 (`FileControl.java`)
   - アンケート管理 (`SurveyControl.java`)
   - ターゲット管理 (`TargetControl.java`)
   - トークン管理 (`TokenControl.java`)
   - 設定 (`ConfigControl.java`)
   - 外部連携 (`ConnectControl.java`)
   - 通知設定 (`NotifyControl.java`)

### C. 管理機能（`admin/`）
1. **システム設定** (`SystemConfigControl.java`)
2. **ユーザー管理** (`UsersControl.java`)
3. **データベース管理** (`DatabaseControl.java`)
4. **メール設定** (`MailControl.java`)
5. **テンプレート管理** (`TemplateControl.java`)
6. **お知らせ管理** (`NoticeControl.java`)
7. **ピン留め管理** (`PinControl.java`)
8. **集計機能** (`AggregateControl.java`)
9. **ログ管理** (`LoggingControl.java`)
10. **設定管理** (`ConfigControl.java`)
11. **LDAP設定** (`LdapControl.java`)
12. **プロキシ設定** (`ProxyControl.java`)
13. **メールフック** (`MailhookControl.java`)
14. **メールテンプレート** (`MailTemplateControl.java`)
15. **Webhook設定** (`WebhookControl.java`)
16. **カスタムサービス** (`CustomServiceControl.java`)

### D. API機能（`api/`）
1. **添付ファイル** (`AttachControl.java`)
2. **グループAPI** (`GroupsControl.java`)
3. **ナレッジAPI** (`KnowledgesControl.java`)
4. **ユーザーAPI** (`UsersControl.java`)
5. **サンプルAPI** (`SampleControl.java`)
6. **公開API** (`open/api/`)
   - ナレッジ検索API (`KnowledgeSearchControl.java`)
   - ユーザーAPI (`UserApiControl.java`)

## 📄 ビュー構造分析（JSP）

### 主要ビューカテゴリ
1. **認証関連** (`auth/`)
2. **管理画面** (`admin/`) - 16カテゴリ
3. **公開ページ** (`open/`) - 8カテゴリ  
4. **保護ページ** (`protect/`) - 10カテゴリ
5. **共通レイアウト** (`commons/`)
6. **エラーページ** (`commons/errors/`)

## 🔧 技術スタック分析

### 現在のJavaアーキテクチャ
- **フレームワーク**: 独自フレームワーク（MVC）
- **ビュー**: JSP + JSTL
- **ORM**: 独自ORMapping
- **DI**: 独自DIコンテナ
- **バリデーション**: 独自バリデーション
- **認証**: 独自認証システム

### フロントエンド技術
- **CSS**: Bootstrap系テーマ（17種類）
- **JavaScript**: jQuery + 独自JS
- **エディタ**: Markdown対応
- **アップロード**: ドラッグ&ドロップ
- **リアルタイム**: WebSocket

## 📋 移植優先度分析

### 🔴 高優先度（Core機能）
1. **認証システム**
   - ユーザー登録・ログイン
   - パスワードリセット
   - 基本的な認可

2. **ナレッジ基本機能**
   - ナレッジ作成・編集・削除・表示
   - マークダウン対応
   - ファイル添付
   - タグ機能

3. **ユーザー管理**
   - プロフィール管理
   - 基本設定

4. **検索機能**
   - 基本検索・一覧表示

### 🟡 中優先度（Social機能）
1. **ソーシャル機能**
   - いいね・コメント
   - ストック機能

2. **グループ機能**
   - グループ管理
   - グループ権限

3. **通知機能**
   - 基本通知
   - メール通知

### 🟢 低優先度（Advanced機能）
1. **管理機能**
   - システム設定
   - ユーザー管理

2. **高度な機能**
   - アンケート機能
   - イベント機能
   - テンプレート機能
   - Webhook連携

3. **レポート・分析**
   - 集計機能
   - アクセス解析

## 🚫 移植不要機能
- **イベントカレンダー関連** (要件で除外指定)
- 一部の管理機能（段階的実装）

---
*このレポートは移植計画の立案に使用します*