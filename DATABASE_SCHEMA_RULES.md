# 📋 データベーススキーマ開発ルール

## 🚫 厳格な制限事項

### 1. スキーマ変更の完全禁止
- **既存テーブル構造の変更禁止**: Java版PostgreSQLスキーマからの逸脱は一切禁止
- **カラムの追加・削除・変更禁止**: データ型、制約、デフォルト値の変更不可
- **テーブル名・カラム名の変更禁止**: 命名規則の統一のための変更も不可

### 2. 互換性維持の原則
- **完全データ互換性**: Java版の1.8GBデータが100%インポート可能であること
- **機能的互換性**: 既存機能の動作を完全に保証すること
- **API互換性**: 既存のデータアクセスパターンを維持すること

## ✅ 許可される操作

### 1. Laravel固有の適応
```php
// ❌ 禁止: 既存カラムの変更
$table->timestamp('insert_datetime')->change();

// ✅ 許可: Eloquentモデルでの対応
protected $dates = ['insert_datetime', 'update_datetime'];

// ✅ 許可: アクセサ・ミューテータでの対応
public function getCreatedAtAttribute() {
    return $this->insert_datetime;
}
```

### 2. パフォーマンス最適化
```sql
-- ✅ 許可: インデックスの追加
CREATE INDEX idx_knowledge_public_flag ON knowledges(public_flag);

-- ❌ 禁止: カラムの追加
ALTER TABLE knowledges ADD COLUMN new_column VARCHAR(255);
```

### 3. アプリケーション層での適応
```php
// ✅ 許可: モデルでの柔軟な対応
class User extends Model {
    protected $table = 'users';
    protected $primaryKey = 'user_id';
    public $timestamps = false;
    
    // カラム名の違いを吸収
    public function getEmailAttribute() {
        return $this->mail_address;
    }
}
```

## 📊 Java版スキーマ基準

### テーブル数: 52テーブル
主要テーブル構造:

#### users (14カラム)
```
user_id, user_key, user_name, password, salt, locale_key, 
mail_address, auth_ldap, row_id, insert_user, insert_datetime, 
update_user, update_datetime, delete_flag
```

#### knowledges (17カラム)  
```
knowledge_id, title, content, public_flag, tag_ids, tag_names,
like_count, comment_count, type_id, insert_user, insert_datetime,
update_user, update_datetime, delete_flag, notify_status, 
view_count, point
```

#### knowledge_files (13カラム)
```
file_no, knowledge_id, comment_no, file_name, file_size, 
file_binary, parse_status, insert_user, insert_datetime,
update_user, update_datetime, delete_flag, draft_id
```

### 新規追加必須テーブル
- `item_choices` (10カラム)
- `draft_knowledges` (14カラム) 
- `draft_item_values` (10カラム)
- `activities` (9カラム)
- その他48テーブル

## 🔧 実装ガイドライン

### 1. マイグレーション作成
```php
// 必須: Java版スキーマの完全再現
Schema::create('users', function (Blueprint $table) {
    $table->bigInteger('user_id')->primary();
    $table->string('user_key');
    $table->string('user_name');
    $table->string('password');
    $table->string('salt')->nullable();
    $table->string('locale_key')->nullable();
    $table->string('mail_address');
    $table->integer('auth_ldap');
    $table->string('row_id')->nullable();
    $table->integer('insert_user');
    $table->timestamp('insert_datetime');
    $table->integer('update_user');
    $table->timestamp('update_datetime');
    $table->integer('delete_flag')->nullable();
});
```

### 2. Eloquentモデル設定
```php
class User extends Model {
    protected $table = 'users';
    protected $primaryKey = 'user_id';
    public $timestamps = false;
    
    protected $fillable = [
        'user_key', 'user_name', 'password', 'salt',
        'locale_key', 'mail_address', 'auth_ldap', 'row_id'
    ];
    
    protected $dates = ['insert_datetime', 'update_datetime'];
    
    // Laravel規約への適応
    public function getEmailAttribute() { return $this->mail_address; }
    public function getCreatedAtAttribute() { return $this->insert_datetime; }
    public function getUpdatedAtAttribute() { return $this->update_datetime; }
}
```

### 3. データ投入・検証手順
```bash
# 1. 新スキーマでのマイグレーション
php artisan migrate:fresh

# 2. Java版データの完全インポート
php artisan db:import-java-dump --file=java_knowledge_dump.sql --direct-psql

# 3. データ整合性の検証
php artisan db:validate-import

# 4. 機能テストの実行
php artisan test --filter=CompatibilityTest
```

## 🎯 成功基準

### 1. 技術基準
- ✅ Java版データの100%インポート成功
- ✅ 全テーブルのデータ整合性検証通過
- ✅ 基本CRUD操作の動作確認

### 2. 互換性基準
- ✅ 既存機能の完全再現
- ✅ データ形式の完全互換性
- ✅ パフォーマンスの維持・向上

### 3. 開発効率基準
- ✅ スキーマ由来エラーの完全排除
- ✅ 安定した開発環境の構築
- ✅ 明確な開発指針の確立

## 🚨 違反時の対応

### 1. スキーマ変更の検出
```bash
# 定期的なスキーマ差分チェック
php artisan schema:compare --baseline=java_schema.json
```

### 2. 違反時の修正手順
1. **即座に変更を取り消し**
2. **Java版スキーマとの差分を確認**
3. **アプリケーション層での代替実装を検討**
4. **必要に応じてチームでの議論**

---

**このルールに従うことで、安全で効率的な開発が可能になります。**

🤝 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>