# ページ単位移植計画

## 📋 概要

旧JavaシステムのJSPページを1ページずつNext.jsに移植し、**見た目・機能・動作を完全に同等**にする詳細計画。

## 🎯 移植原則

### 完全移行の定義
1. **レイアウト同等性**: CSS、HTML構造、配置が旧システムと同一
2. **機能同等性**: ボタン、フォーム、バリデーション、エラーハンドリングが同一
3. **データ同等性**: 表示内容、並び順、ページネーションが同一
4. **URL同等性**: 可能な限り同じURLパス構造を維持

### 作業単位
- **1 Issue = 1 JSPページ**の移植
- 各Issueで対応する**Controller + JSP + CSS + JS**を明記
- 移植前後の**スクリーンショット比較**を必須とする

## 📄 全JSPページ一覧と移植計画

### A. 認証関連 (`auth/`) - 2ページ
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #A-1 | `auth/form.jsp` | 複数Controller | 🔴高 | 3日 |
| #A-2 | `auth/authorizerError.jsp` | AuthController | 🟡中 | 1日 |

### B. 公開ページ (`open/`) - 31ページ

#### B1. アカウント関連
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #B1-1 | `open/account/account.jsp` | `AccountControl.java` | 🔴高 | 2日 |

#### B2. ナレッジ関連 
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #B2-1 | `open/knowledge/list.jsp` | `KnowledgeControl.java` | 🔴高 | 5日 |
| #B2-2 | `open/knowledge/view.jsp` | `KnowledgeControl.java` | 🔴高 | 7日 |
| #B2-3 | `open/knowledge/search.jsp` | `KnowledgeControl.java` | 🔴高 | 4日 |
| #B2-4 | `open/knowledge/popularity.jsp` | `KnowledgeControl.java` | 🟡中 | 3日 |
| #B2-5 | `open/knowledge/histories.jsp` | `KnowledgeControl.java` | 🟡中 | 3日 |
| #B2-6 | `open/knowledge/history.jsp` | `KnowledgeControl.java` | 🟡中 | 2日 |
| #B2-7 | `open/knowledge/show_history.jsp` | `KnowledgeControl.java` | 🟡中 | 2日 |
| #B2-8 | `open/knowledge/likes.jsp` | `KnowledgeControl.java` | 🟡中 | 2日 |
| #B2-9 | `open/knowledge/stocks.jsp` | `KnowledgeControl.java` | 🟡中 | 2日 |
| #B2-10 | `open/knowledge/events.jsp` | `EventControl.java` | 🚫除外 | - |

#### B3. パスワード・サインアップ関連
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #B3-1 | `open/passwordinitialization/forgot_pass_request.jsp` | `PasswordInitializationControl.java` | 🔴高 | 2日 |
| #B3-2 | `open/passwordinitialization/forgot_pass_result.jsp` | `PasswordInitializationControl.java` | 🔴高 | 1日 |
| #B3-3 | `open/passwordinitialization/password_reset.jsp` | `PasswordInitializationControl.java` | 🔴高 | 2日 |
| #B3-4 | `open/passwordinitialization/reset_result.jsp` | `PasswordInitializationControl.java` | 🔴高 | 1日 |
| #B3-5 | `open/signup/provisional_registration.jsp` | `SignupControl.java` | 🔴高 | 2日 |
| #B3-6 | `open/signup/signup.jsp` | `SignupControl.java` | 🔴高 | 3日 |
| #B3-7 | `open/signup/signup_done.jsp` | `SignupControl.java` | 🔴高 | 1日 |
| #B3-8 | `open/signup/mail_sended.jsp` | `SignupControl.java` | 🔴高 | 1日 |

#### B4. その他公開機能
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #B4-1 | `open/tag/list.jsp` | `TagControl.java` | 🟡中 | 2日 |
| #B4-2 | `open/tag/dialog.jsp` | `TagControl.java` | 🟡中 | 1日 |
| #B4-3 | `open/notice/list.jsp` | `NoticeControl.java` | 🟡中 | 2日 |
| #B4-4 | `open/language/index.jsp` | `LanguageControl.java` | 🟢低 | 1日 |
| #B4-5 | `open/license/index.jsp` | `LicenseControl.java` | 🟢低 | 1日 |
| #B4-6 | `open/thema/list.jsp` | `ThemaControl.java` | 🟢低 | 2日 |
| #B4-7 | `open/thema/thema.jsp` | `ThemaControl.java` | 🟢低 | 1日 |
| #B4-8 | `open/thema/highlight.jsp` | `ThemaControl.java` | 🟢低 | 1日 |
| #B4-9 | `open/emoji/cheatsheet.jsp` | `EmojiControl.java` | 🟢低 | 2日 |
| #B4-10 | `open/emoji/nature.jsp` | `EmojiControl.java` | 🟢低 | 1日 |
| #B4-11 | `open/emoji/objects.jsp` | `EmojiControl.java` | 🟢低 | 1日 |
| #B4-12 | `open/emoji/people.jsp` | `EmojiControl.java` | 🟢低 | 1日 |
| #B4-13 | `open/emoji/places.jsp` | `EmojiControl.java` | 🟢低 | 1日 |
| #B4-14 | `open/emoji/symbols.jsp` | `EmojiControl.java` | 🟢低 | 1日 |

### C. 保護ページ (`protect/`) - 29ページ

#### C1. ナレッジ編集関連
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #C1-1 | `protect/knowledge/edit.jsp` | `KnowledgeControl.java` | 🔴高 | 10日 |
| #C1-2 | `protect/knowledge/edit_comment.jsp` | `KnowledgeControl.java` | 🟡中 | 3日 |
| #C1-3 | `protect/knowledge/markdown.jsp` | `KnowledgeControl.java` | 🔴高 | 5日 |

#### C2. アカウント管理
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #C2-1 | `protect/account/index.jsp` | `AccountControl.java` | 🔴高 | 3日 |
| #C2-2 | `protect/account/changekey.jsp` | `AccountControl.java` | 🔴高 | 2日 |
| #C2-3 | `protect/account/complete.jsp` | `AccountControl.java` | 🔴高 | 1日 |
| #C2-4 | `protect/account/saveresult.jsp` | `AccountControl.java` | 🔴高 | 1日 |
| #C2-5 | `protect/account/targets.jsp` | `AccountControl.java` | 🟡中 | 2日 |
| #C2-6 | `protect/account/withdrawal.jsp` | `AccountControl.java` | 🟡中 | 2日 |

#### C3. グループ管理
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #C3-1 | `protect/group/groups.jsp` | `GroupControl.java` | 🟡中 | 3日 |
| #C3-2 | `protect/group/mygroups.jsp` | `GroupControl.java` | 🟡中 | 2日 |
| #C3-3 | `protect/group/add_group.jsp` | `GroupControl.java` | 🟡中 | 3日 |
| #C3-4 | `protect/group/edit_group.jsp` | `GroupControl.java` | 🟡中 | 3日 |
| #C3-5 | `protect/group/view_group.jsp` | `GroupControl.java` | 🟡中 | 2日 |
| #C3-6 | `protect/group/dialog.jsp` | `GroupControl.java` | 🟡中 | 1日 |

#### C4. その他保護機能
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #C4-1 | `protect/stock/list.jsp` | `StockControl.java` | 🟡中 | 2日 |
| #C4-2 | `protect/stock/add.jsp` | `StockControl.java` | 🟡中 | 2日 |
| #C4-3 | `protect/stock/edit.jsp` | `StockControl.java` | 🟡中 | 2日 |
| #C4-4 | `protect/stock/knowledge.jsp` | `StockControl.java` | 🟡中 | 2日 |
| #C4-5 | `protect/draft/drafts.jsp` | `DraftControl.java` | 🟡中 | 3日 |
| #C4-6 | `protect/notification/list.jsp` | `NotificationControl.java` | 🟡中 | 3日 |
| #C4-7 | `protect/notification/view.jsp` | `NotificationControl.java` | 🟡中 | 2日 |
| #C4-8 | `protect/notification/not_found.jsp` | `NotificationControl.java` | 🟡中 | 1日 |
| #C4-9 | `protect/config/index.jsp` | `ConfigControl.java` | 🟡中 | 2日 |
| #C4-10 | `protect/connect/index.jsp` | `ConnectControl.java` | 🟢低 | 2日 |
| #C4-11 | `protect/connect/config.jsp` | `ConnectControl.java` | 🟢低 | 2日 |
| #C4-12 | `protect/notify/index.jsp` | `NotifyControl.java` | 🟡中 | 2日 |
| #C4-13 | `protect/notify/test.jsp` | `NotifyControl.java` | 🟡中 | 1日 |
| #C4-14 | `protect/survey/edit.jsp` | `SurveyControl.java` | 🟢低 | 4日 |
| #C4-15 | `protect/survey/answers.jsp` | `SurveyControl.java` | 🟢低 | 3日 |
| #C4-16 | `protect/token/index.jsp` | `TokenControl.java` | 🟢低 | 2日 |

### D. 管理ページ (`admin/`) - 35ページ

#### D1. 基本管理機能
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #D1-1 | `admin/users/list.jsp` | `UsersControl.java` | 🟡中 | 4日 |
| #D1-2 | `admin/users/view_add.jsp` | `UsersControl.java` | 🟡中 | 3日 |
| #D1-3 | `admin/users/view_edit.jsp` | `UsersControl.java` | 🟡中 | 3日 |
| #D1-4 | `admin/users/accept_list.jsp` | `UsersControl.java` | 🟡中 | 2日 |
| #D1-5 | `admin/config/config.jsp` | `ConfigControl.java` | 🟡中 | 3日 |
| #D1-6 | `admin/config/system.jsp` | `ConfigControl.java` | 🟡中 | 3日 |
| #D1-7 | `admin/config/analytics.jsp` | `ConfigControl.java` | 🟢低 | 2日 |
| #D1-8 | `admin/systemconfig/index.jsp` | `SystemConfigControl.java` | 🟡中 | 3日 |

#### D2. データベース・ログ管理
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #D2-1 | `admin/database/index.jsp` | `DatabaseControl.java` | 🟢低 | 3日 |
| #D2-2 | `admin/database/connection.jsp` | `DatabaseControl.java` | 🟢低 | 2日 |
| #D2-3 | `admin/database/export.jsp` | `DatabaseControl.java` | 🟢低 | 3日 |
| #D2-4 | `admin/database/reindexing.jsp` | `DatabaseControl.java` | 🟢低 | 2日 |
| #D2-5 | `admin/logging/index.jsp` | `LoggingControl.java` | 🟢低 | 2日 |
| #D2-6 | `admin/aggregate/index.jsp` | `AggregateControl.java` | 🟢低 | 3日 |

#### D3. メール・通知管理
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #D3-1 | `admin/mail/config.jsp` | `MailControl.java` | 🟢低 | 3日 |
| #D3-2 | `admin/mailtemplate/index.jsp` | `MailTemplateControl.java` | 🟢低 | 3日 |
| #D3-3 | `admin/mailhook/config.jsp` | `MailhookControl.java` | 🟢低 | 3日 |
| #D3-4 | `admin/mailhook/hook.jsp` | `MailhookControl.java` | 🟢低 | 2日 |
| #D3-5 | `admin/notice/list.jsp` | `NoticeControl.java` | 🟡中 | 2日 |

#### D4. その他管理機能
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #D4-1 | `admin/template/list.jsp` | `TemplateControl.java` | 🟢低 | 3日 |
| #D4-2 | `admin/template/edit.jsp` | `TemplateControl.java` | 🟢低 | 5日 |
| #D4-3 | `admin/template/include_template_label.jsp` | `TemplateControl.java` | 🟢低 | 1日 |
| #D4-4 | `admin/pin/index.jsp` | `PinControl.java` | 🟢低 | 2日 |
| #D4-5 | `admin/ldap/config.jsp` | `LdapControl.java` | 🟢低 | 3日 |
| #D4-6 | `admin/ldap/list.jsp` | `LdapControl.java` | 🟢低 | 2日 |
| #D4-7 | `admin/proxy/config.jsp` | `ProxyControl.java` | 🟢低 | 2日 |
| #D4-8 | `admin/webhook/config.jsp` | `WebhookControl.java` | 🟢低 | 3日 |
| #D4-9 | `admin/customservice/config.jsp` | `CustomServiceControl.java` | 🟢低 | 3日 |

### E. 共通ページ (`commons/`) - 10ページ

#### E1. レイアウト
| Issue | JSPファイル | 用途 | 優先度 | 推定工数 |
|-------|------------|------|--------|----------|
| #E1-1 | `commons/layout/layoutMain.jsp` | メインレイアウト | 🔴高 | 5日 |
| #E1-2 | `commons/layout/layoutNoMenu.jsp` | メニューなしレイアウト | 🔴高 | 3日 |
| #E1-3 | `commons/layout/layoutTop.jsp` | トップページレイアウト | 🔴高 | 3日 |
| #E1-4 | `commons/layout/commonHeader.jsp` | 共通ヘッダー | 🔴高 | 3日 |
| #E1-5 | `commons/layout/commonFooter.jsp` | 共通フッター | 🔴高 | 2日 |
| #E1-6 | `commons/layout/commonNavbar.jsp` | ナビゲーションバー | 🔴高 | 4日 |
| #E1-7 | `commons/layout/commonScripts.jsp` | 共通スクリプト | 🔴高 | 2日 |

#### E2. エラー・その他
| Issue | JSPファイル | 用途 | 優先度 | 推定工数 |
|-------|------------|------|--------|----------|
| #E2-1 | `commons/errors/error.jsp` | エラーページ | 🔴高 | 1日 |
| #E2-2 | `commons/errors/not_found.jsp` | 404エラー | 🔴高 | 1日 |
| #E2-3 | `commons/errors/server_error.jsp` | 500エラー | 🔴高 | 1日 |
| #E2-4 | `commons/errors/forbidden.jsp` | 403エラー | 🔴高 | 1日 |
| #E2-5 | `commons/errors/unauthorized.jsp` | 401エラー | 🔴高 | 1日 |
| #E2-6 | `commons/maintenance.jsp` | メンテナンスページ | 🟡中 | 1日 |
| #E2-7 | `commons/migrate.jsp` | マイグレーションページ | 🟢低 | 1日 |

### F. その他ページ - 3ページ
| Issue | JSPファイル | Controller | 優先度 | 推定工数 |
|-------|------------|------------|--------|----------|
| #F-1 | `index/index.jsp` | `IndexControl.java` | 🔴高 | 4日 |
| #F-2 | `commons/notice/notice.jsp` | 通知表示 | 🟡中 | 2日 |

## 📊 移植統計

### 総計
- **総ページ数**: 110ページ
- **総推定工数**: 約280日
- **除外ページ**: 1ページ（イベント関連）

### 優先度別
- 🔴 **高優先度**: 39ページ（123日）
- 🟡 **中優先度**: 41ページ（92日）  
- 🟢 **低優先度**: 29ページ（65日）

### カテゴリ別
- **認証**: 2ページ（4日）
- **公開**: 30ページ（66日）
- **保護**: 29ページ（72日）
- **管理**: 35ページ（90日）
- **共通**: 13ページ（30日）
- **その他**: 3ページ（6日）

## 🎯 段階的実装計画

### フェーズ1: 共通・認証（2週間）
**Issues**: #E1-1〜#E1-7, #E2-1〜#E2-5, #A-1〜#A-2, #F-1
- 共通レイアウト構築
- エラーページ
- 認証システム
- トップページ

### フェーズ2: ナレッジ基本機能（3週間）
**Issues**: #B2-1〜#B2-3, #C1-1〜#C1-3
- ナレッジ一覧・詳細・検索
- ナレッジ編集機能
- マークダウン機能

### フェーズ3: アカウント・基本機能（2週間）
**Issues**: #B1-1, #B3-1〜#B3-8, #C2-1〜#C2-4
- アカウント表示・編集
- パスワードリセット
- サインアップ機能

### フェーズ4: ソーシャル・グループ機能（3週間）
**Issues**: #B2-4〜#B2-9, #C3-1〜#C3-6, #C4-1〜#C4-4
- いいね・履歴・ストック
- グループ管理
- ストック機能

### フェーズ5: 通知・その他機能（2週間）
**Issues**: #C4-5〜#C4-8, #C4-12〜#C4-13, #B4-1〜#B4-3
- 通知機能
- 下書き機能
- タグ・お知らせ

### フェーズ6: 管理機能（4週間）
**Issues**: #D1-1〜#D1-8, #D2-5, #D3-5
- ユーザー管理
- システム設定
- お知らせ管理

### フェーズ7: 低優先度機能（3週間）
**Issues**: 残りの🟢低優先度Issues
- その他管理機能
- 高度な設定機能

## 📝 Issue作成テンプレート

### 各ページ用Issue
```markdown
## 📄 ページ移植: [JSPファイル名]

### 移植対象
- **JSPファイル**: `src/main/webapp/WEB-INF/views/[パス]`
- **Controller**: `[Controllerクラス名]`
- **関連CSS**: `src/main/webapp/css/[CSSファイル]`
- **関連JS**: `src/main/webapp/js/[JSファイル]`

### 実装要件
- [ ] URLパス同等性
- [ ] レイアウト同等性
- [ ] 機能同等性
- [ ] バリデーション同等性
- [ ] エラーハンドリング同等性

### 完了条件
- [ ] 旧システムとの**スクリーンショット比較**完了
- [ ] 全フォーム・ボタンの動作確認完了
- [ ] レスポンシブ対応確認完了
- [ ] テスト実装・成功
- [ ] コードレビュー完了

### 参考資料
- 旧システムページ: [URL]
- スクリーンショット: [添付]
```

## 🔍 品質担保

### 各Issue完了時の必須チェック
1. **スクリーンショット比較**: 旧システムと新システムの画面キャプチャ比較
2. **機能テスト**: 全ボタン・フォーム・リンクの動作確認
3. **データ表示確認**: 同じデータでの表示内容比較
4. **エラーケース確認**: バリデーション・エラーハンドリングの同等性
5. **レスポンシブ確認**: 複数デバイスでの表示確認

### 移植漏れ防止策
- **ページリスト**: 全110ページのチェックリスト管理
- **機能マトリックス**: Controller×JSPの対応表で漏れチェック
- **定期レビュー**: 週次での進捗・品質確認会議

この詳細計画により、**ページ単位での完全移行**を確実に実現できます。