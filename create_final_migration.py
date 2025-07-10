#!/usr/bin/env python3
"""
最終版：正確なデータ型でJava互換マイグレーションを生成
"""
import json

def create_final_migration():
    """データ型エラーを修正した最終版マイグレーション"""
    
    # スキーマ読み込み
    with open('/home/ubuntu01/workspace/knowledge/java_schema.json', 'r') as f:
        schema = json.load(f)
    
    # 文字列IDテーブルの修正
    string_id_tables = {
        't_jyumin': 'varchar(255)',
        'ldap_configs': 'varchar(255)', 
        'locales': 'varchar(255)',
        'mail_configs': 'varchar(255)',
        'mail_locale_templates': 'varchar(255)',
        'mails': 'varchar(255)',
        'notify_queues': 'varchar(255)',
        'service_configs': 'varchar(255)',
        'system_configs': 'varchar(255)',
        'systems': 'varchar(255)',
        'user_configs': 'varchar(255)',
        'webhooks': 'varchar(255)'
    }
    
    # プライマリキー定義
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
        'webhooks': 'webhook_id',
        'user_alias': 'user_key',
        'ldap_configs': 'system_name',
        'locales': 'locale_key',
        'mail_configs': 'system_name',
        'mail_locale_templates': 'template_id',
        'notify_queues': 'hash',
        'service_configs': 'service_name', 
        'system_configs': 'system_name',
        'user_configs': 'system_name',
        't_jyumin': 'jumin_no'
    }
    
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
    
    # 重要テーブルを優先配置
    priority_tables = ['users', 'groups', 'roles', 'tags', 'knowledges', 'comments', 
                      'knowledge_files', 'knowledge_tags', 'likes', 'like_comments']
    
    ordered_tables = []
    for table in priority_tables:
        if table in schema:
            ordered_tables.append(table)
    
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
            col_lower = column.lower()
            
            # プライマリキー
            if column == primary_keys.get(table_name):
                if table_name in string_id_tables:
                    migration_content += f"            $table->string('{column}')->primary();\n"
                else:
                    migration_content += f"            $table->bigIncrements('{column}');\n"
            
            # row_idは文字列（ハッシュ値）
            elif column == 'row_id':
                migration_content += f"            $table->string('{column}')->nullable();\n"
            
            # その他のID系
            elif col_lower.endswith('_id') or col_lower.endswith('_no'):
                migration_content += f"            $table->integer('{column}')->nullable();\n"
            
            # ユーザー系
            elif column in ['insert_user', 'update_user']:
                migration_content += f"            $table->integer('{column}');\n"
            
            # 日時系
            elif 'datetime' in col_lower or column in ['insert_datetime', 'update_datetime']:
                migration_content += f"            $table->timestamp('{column}');\n"
            
            # フラグ・ステータス・カウント系
            elif any(keyword in col_lower for keyword in ['flag', 'status', 'count', 'ldap']):
                migration_content += f"            $table->integer('{column}')->nullable();\n"
            
            # テキスト系
            elif column in ['content', 'comment', 'description', 'init_content', 'salt', 'password']:
                migration_content += f"            $table->text('{column}')->nullable();\n"
            
            # バイナリ系
            elif 'binary' in col_lower:
                migration_content += f"            $table->text('{column}')->nullable();\n"
            
            # その他は文字列
            else:
                migration_content += f"            $table->string('{column}')->nullable();\n"
        
        # インデックス追加
        for column in columns:
            if column.endswith('_id') and column != primary_keys.get(table_name):
                migration_content += f"            $table->index('{column}');\n"
            elif column == 'delete_flag':
                migration_content += f"            $table->index('delete_flag');\n"
        
        # 複合プライマリキー
        if table_name == 'knowledge_tags':
            migration_content += "            $table->primary(['knowledge_id', 'tag_id']);\n"
        elif table_name == 'knowledge_users':
            migration_content += "            $table->primary(['knowledge_id', 'user_id']);\n"
        elif table_name == 'knowledge_groups':
            migration_content += "            $table->primary(['knowledge_id', 'group_id']);\n"
        elif table_name == 'knowledge_edit_users':
            migration_content += "            $table->primary(['knowledge_id', 'user_id']);\n"
        elif table_name == 'knowledge_edit_groups':
            migration_content += "            $table->primary(['knowledge_id', 'group_id']);\n"
        
        migration_content += '''        });
'''
    
    migration_content += '''    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
'''
    
    for table_name in reversed(ordered_tables):
        migration_content += f"        Schema::dropIfExists('{table_name}');\n"
    
    migration_content += '''    }
};
'''
    
    return migration_content

if __name__ == "__main__":
    migration_content = create_final_migration()
    
    output_file = "/home/ubuntu01/workspace/knowledge/laravel/knowledge-laravel/database/migrations/2025_01_08_000003_create_final_java_compatible_schema.php"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(migration_content)
    
    print("✅ 最終版マイグレーションファイルを作成しました！")
    print(f"📄 ファイル: {output_file}")
    print("\n次のステップ:")
    print("1. データベースを再構築: php artisan migrate:fresh --path=database/migrations/2025_01_08_000003_create_final_java_compatible_schema.php")
    print("2. データインポート: php artisan db:import-java-dump --file=/var/www/html/java_knowledge_dump.sql --direct-psql")