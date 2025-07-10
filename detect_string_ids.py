#!/usr/bin/env python3
"""
文字列のIDを使用しているテーブルを検出
"""
import re
import json

def detect_string_ids(dump_file_path):
    """文字列IDを使用しているテーブルを検出"""
    
    string_id_tables = {}
    
    with open(dump_file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            # INSERT文からテーブルとデータを抽出
            insert_match = re.match(r'INSERT INTO (\w+) \([^)]+\) VALUES \(([^)]+)\)', line)
            if insert_match:
                table_name = insert_match.group(1)
                values = insert_match.group(2)
                
                # 最初のカラム（通常はID）の値を取得
                first_value = values.split(',')[0].strip()
                
                # 文字列かどうかチェック（クォートで囲まれている）
                if first_value.startswith("'") and first_value.endswith("'"):
                    actual_value = first_value[1:-1]  # クォートを除去
                    
                    # 数値でない場合は文字列ID
                    if not actual_value.isdigit():
                        if table_name not in string_id_tables:
                            string_id_tables[table_name] = []
                        if len(string_id_tables[table_name]) < 5:  # 最初の5個のサンプルを保存
                            string_id_tables[table_name].append(actual_value)
                        
                        if len(string_id_tables[table_name]) == 1:
                            print(f"Found string ID table: {table_name}, example: {actual_value}")
            
            # 進捗表示
            if line_num % 500000 == 0:
                print(f"Processed {line_num} lines...")
    
    return string_id_tables

def generate_corrected_migration(string_id_tables, original_schema):
    """文字列IDテーブルを修正したマイグレーションを生成"""
    
    # 修正が必要なテーブルの主キー情報
    pk_corrections = {}
    for table_name, examples in string_id_tables.items():
        example = examples[0] if examples else ""
        
        # IDの形式を分析してデータ型を決定
        if "Notify-" in example and len(example) > 30:
            pk_corrections[table_name] = "$table->string('{}', 255)->primary();"
        elif len(example) > 100:
            pk_corrections[table_name] = "$table->text('{}')->primary();"
        else:
            pk_corrections[table_name] = "$table->string('{}')->primary();"
    
    print("\nRequired corrections:")
    for table, correction in pk_corrections.items():
        print(f"  {table}: {correction}")
    
    return pk_corrections

if __name__ == "__main__":
    dump_file = "/home/ubuntu01/workspace/knowledge/laravel/knowledge-laravel/java_knowledge_dump.sql"
    
    print("Detecting string ID tables from Java PostgreSQL dump...")
    string_id_tables = detect_string_ids(dump_file)
    
    print(f"\nFound {len(string_id_tables)} tables with string IDs:")
    for table_name, examples in string_id_tables.items():
        print(f"  {table_name}: {examples[:2]}...")  # 最初の2つの例を表示
    
    # オリジナルスキーマを読み込み
    with open("/home/ubuntu01/workspace/knowledge/java_schema.json", 'r') as f:
        original_schema = json.load(f)
    
    corrections = generate_corrected_migration(string_id_tables, original_schema)
    
    # 修正情報を保存
    with open("/home/ubuntu01/workspace/knowledge/string_id_corrections.json", 'w') as f:
        json.dump(corrections, f, indent=2)
    
    print(f"\nCorrections saved to: /home/ubuntu01/workspace/knowledge/string_id_corrections.json")