#!/usr/bin/env python3
"""
Java版PostgreSQLダンプファイルからテーブル構造を抽出するスクリプト
"""
import re
import json
from collections import defaultdict

def extract_table_schema_from_dump(dump_file_path):
    """SQLダンプファイルからテーブル構造を抽出"""
    tables = defaultdict(list)
    
    with open(dump_file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            # INSERT文からテーブルとカラムを抽出
            insert_match = re.match(r'INSERT INTO (\w+) \(([^)]+)\)', line)
            if insert_match:
                table_name = insert_match.group(1)
                columns = [col.strip() for col in insert_match.group(2).split(',')]
                
                # テーブルが初回出現の場合のみ記録
                if table_name not in tables:
                    tables[table_name] = columns
                    print(f"Found table: {table_name} with {len(columns)} columns")
            
            # 進捗表示
            if line_num % 100000 == 0:
                print(f"Processed {line_num} lines...")
    
    return dict(tables)

def generate_laravel_migration(tables):
    """Laravel Migration形式でテーブル構造を生成"""
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
    
    for table_name, columns in tables.items():
        migration_content += f'''
        // {table_name}テーブル
        Schema::create('{table_name}', function (Blueprint $table) {{
'''
        
        for column in columns:
            # カラム名から推測してデータ型を決定
            if any(keyword in column.lower() for keyword in ['id', '_no']):
                if column.endswith('_id') or column.endswith('_no'):
                    migration_content += f"            $table->integer('{column}');\n"
                else:
                    migration_content += f"            $table->id('{column}');\n"
            elif 'datetime' in column.lower():
                migration_content += f"            $table->timestamp('{column}')->useCurrent();\n"
            elif any(keyword in column.lower() for keyword in ['flag', 'status', 'count']):
                migration_content += f"            $table->integer('{column}')->nullable();\n"
            elif 'content' in column.lower():
                migration_content += f"            $table->text('{column}')->nullable();\n"
            else:
                migration_content += f"            $table->string('{column}')->nullable();\n"
        
        migration_content += '''        });
'''
    
    migration_content += '''    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
'''
    
    for table_name in tables.keys():
        migration_content += f"        Schema::dropIfExists('{table_name}');\n"
    
    migration_content += '''    }
};
'''
    
    return migration_content

if __name__ == "__main__":
    dump_file = "/home/ubuntu01/workspace/knowledge/laravel/knowledge-laravel/java_knowledge_dump.sql"
    
    print("Extracting table schema from Java PostgreSQL dump...")
    tables = extract_table_schema_from_dump(dump_file)
    
    print(f"\nFound {len(tables)} tables:")
    for table_name, columns in tables.items():
        print(f"  {table_name}: {len(columns)} columns")
    
    # JSON形式で保存
    schema_file = "/home/ubuntu01/workspace/knowledge/java_schema.json"
    with open(schema_file, 'w', encoding='utf-8') as f:
        json.dump(tables, f, indent=2, ensure_ascii=False)
    
    print(f"\nSchema saved to: {schema_file}")
    
    # Laravel Migration生成
    migration_content = generate_laravel_migration(tables)
    migration_file = "/home/ubuntu01/workspace/knowledge/laravel/knowledge-laravel/database/migrations/2025_01_08_000001_create_java_compatible_tables.php"
    
    with open(migration_file, 'w', encoding='utf-8') as f:
        f.write(migration_content)
    
    print(f"Laravel Migration generated: {migration_file}")