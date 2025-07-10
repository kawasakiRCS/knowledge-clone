#!/usr/bin/env python3
"""
Java版スキーマを正確に再現するLaravel Migrationを生成
"""
import json

def generate_improved_migration(schema_file):
    """改良されたマイグレーションファイルを生成"""
    
    with open(schema_file, 'r') as f:
        schema = json.load(f)
    
    # プライマリキーと重要なデータ型のマッピング
    primary_keys = {
        'users': 'user_id',
        'knowledges': 'knowledge_id', 
        'knowledge_files': 'file_no',
        'comments': 'comment_no',
        'tags': 'tag_id',
        'account_images': 'image_id',
        'activities': 'activity_no',
        'groups': 'group_id',
        'notices': 'notice_id',
        'events': 'event_id',
        'mails': 'mail_id',
        'roles': 'role_id',
        'systems': 'system_name',
        'template_masters': 'type_id',
        'template_items': 'item_no',
        'webhooks': 'webhook_id'
    }
    
    # データ型の推定ルール
    def get_column_type(table_name, column_name):
        col = column_name.lower()
        
        # プライマリキー
        if column_name == primary_keys.get(table_name):
            if col.endswith('_id') or col.endswith('_no'):
                return "$table->bigInteger('{}')->primary();"
            else:
                return "$table->string('{}')->primary();"
        
        # ID系
        if col.endswith('_id') or col.endswith('_no') or col in ['insert_user', 'update_user']:
            return "$table->integer('{}'){};"
        
        # フラグ・ステータス・カウント系
        if any(keyword in col for keyword in ['flag', 'status', 'count', 'ldap', 'no']):
            return "$table->integer('{}')->nullable();"
        
        # 日時系
        if 'datetime' in col:
            return "$table->timestamp('{}')->useCurrent();"
        
        # テキスト系
        if col in ['content', 'comment', 'description', 'init_content']:
            return "$table->text('{}')->nullable();"
        
        # バイナリ系
        if 'binary' in col:
            return "$table->text('{}')->nullable();"
        
        # その他は文字列
        return "$table->string('{}')->nullable();"
    
    migration_content = '''<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
'''
    
    # 重要なテーブルを優先的に配置
    priority_tables = ['users', 'groups', 'roles', 'tags', 'knowledges', 'comments', 
                      'knowledge_files', 'knowledge_tags', 'likes', 'like_comments']
    
    ordered_tables = []
    for table in priority_tables:
        if table in schema:
            ordered_tables.append(table)
    
    # 残りのテーブルを追加
    for table in schema:
        if table not in ordered_tables:
            ordered_tables.append(table)
    
    for table_name in ordered_tables:
        columns = schema[table_name]
        migration_content += f'''
        // {table_name}テーブル
        Schema::create('{table_name}', function (Blueprint $table) {{
'''
        
        for column in columns:
            # 必須カラムの判定
            required = ""
            if column in ['insert_user', 'update_user', 'insert_datetime', 'update_datetime']:
                required = ""
            elif column == primary_keys.get(table_name):
                required = ""
            elif any(keyword in column.lower() for keyword in ['name', 'title', 'key', 'address']):
                required = ""
            else:
                required = "->nullable()"
            
            column_def = get_column_type(table_name, column).format(column, required)
            migration_content += f"            {column_def}\n"
        
        # インデックスの追加
        if table_name in primary_keys:
            pk = primary_keys[table_name]
            if pk in columns:
                migration_content += f"\n            // インデックス\n"
                
        # 外部キー候補のインデックス
        for column in columns:
            if column.endswith('_id') and column != primary_keys.get(table_name):
                migration_content += f"            $table->index('{column}');\n"
            elif column == 'delete_flag':
                migration_content += f"            $table->index('delete_flag');\n"
        
        migration_content += '''        });
'''
    
    migration_content += '''    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 逆順でテーブル削除
'''
    
    for table_name in reversed(ordered_tables):
        migration_content += f"        Schema::dropIfExists('{table_name}');\n"
    
    migration_content += '''    }
};
'''
    
    return migration_content

if __name__ == "__main__":
    schema_file = "/home/ubuntu01/workspace/knowledge/java_schema.json"
    migration_content = generate_improved_migration(schema_file)
    
    output_file = "/home/ubuntu01/workspace/knowledge/laravel/knowledge-laravel/database/migrations/2025_01_08_000002_create_complete_java_schema.php"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(migration_content)
    
    print(f"Improved migration generated: {output_file}")
    print("Ready for database reconstruction!")