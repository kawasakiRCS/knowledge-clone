<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Exception;

class ImportJavaDump extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'db:import-java-dump
                            {--file= : Path to the Java dump file}
                            {--backup-current : Create backup of current data before import}
                            {--validate : Validate data after import}
                            {--dry-run : Preview changes without executing}
                            {--clear-existing : Clear existing data before import}
                            {--direct-psql : Use psql command directly (recommended for large files)}';

    /**
     * The console command description.
     */
    protected $description = 'Import data from Java Knowledge system PostgreSQL dump file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Java Knowledge Data Import Starting...');
        
        try {
            // パラメータ取得
            $dumpFile = $this->option('file');
            $backupCurrent = $this->option('backup-current');
            $validate = $this->option('validate');
            $dryRun = $this->option('dry-run');
            $clearExisting = $this->option('clear-existing');

            // ファイル存在チェック
            if (!$dumpFile || !File::exists($dumpFile)) {
                $this->error('❌ Dump file not found. Please specify --file option.');
                return self::FAILURE;
            }

            $this->info("📁 Dump file: {$dumpFile}");

            // 現在のデータをバックアップ
            if ($backupCurrent) {
                $this->info('💾 Creating backup of current data...');
                $this->createBackup();
            }

            // 既存データのクリア
            if ($clearExisting) {
                $this->info('🗑️ Clearing existing data...');
                if (!$dryRun) {
                    $this->clearExistingData();
                }
            }

            if ($dryRun) {
                $this->info('🔍 DRY RUN MODE - Analyzing dump file...');
                $stats = $this->analyzeDumpFile($dumpFile);
                $this->info('📊 Preview of changes:');
                $this->table(['Table', 'Estimated Insert Count'], 
                    array_map(fn($table, $count) => [$table, $count], array_keys($stats), $stats)
                );
                return self::SUCCESS;
            }

            // データ投入実行
            if ($this->option('direct-psql')) {
                $this->info('💾 Importing data with direct psql...');
                $this->importDataWithPsql($dumpFile);
            } else {
                $this->info('💾 Importing data with streaming...');
                $this->importDataStreaming($dumpFile);
            }

            // 整合性チェック
            if ($validate) {
                $this->info('✅ Validating imported data...');
                $this->validateImportedData();
            }

            $this->info('🎉 Import completed successfully!');
            return self::SUCCESS;

        } catch (Exception $e) {
            $this->error('❌ Import failed: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return self::FAILURE;
        }
    }

    /**
     * 現在のデータをバックアップ
     */
    protected function createBackup(): void
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $backupFile = "backup_knowledge_data_{$timestamp}.sql";
        
        $tables = ['knowledges', 'users', 'tags', 'knowledge_tags', 'comments', 'knowledge_files'];
        
        $backupSql = "-- Backup created at " . now() . "\n\n";
        
        foreach ($tables as $table) {
            $this->info("  📋 Backing up table: {$table}");
            
            // テーブルデータをSQLとして出力
            $rows = DB::connection('knowledge_legacy')->table($table)->get();
            
            if ($rows->count() > 0) {
                $backupSql .= "-- Table: {$table}\n";
                $backupSql .= "DELETE FROM {$table};\n";
                
                foreach ($rows as $row) {
                    $columns = array_keys((array) $row);
                    $values = array_values((array) $row);
                    
                    // 値をエスケープ
                    $escapedValues = array_map(function($value) {
                        if (is_null($value)) {
                            return 'NULL';
                        }
                        return "'" . str_replace("'", "''", $value) . "'";
                    }, $values);
                    
                    $backupSql .= "INSERT INTO {$table} (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $escapedValues) . ");\n";
                }
                $backupSql .= "\n";
            }
        }
        
        File::put(storage_path("app/backups/{$backupFile}"), $backupSql);
        $this->info("  ✅ Backup saved: storage/app/backups/{$backupFile}");
    }

    /**
     * 既存データをクリア
     */
    protected function clearExistingData(): void
    {
        $tables = ['knowledge_files', 'comments', 'knowledge_tags', 'knowledges', 'tags', 'users'];
        
        DB::connection('knowledge_legacy')->transaction(function() use ($tables) {
            foreach ($tables as $table) {
                $this->info("  🗑️ Clearing table: {$table}");
                DB::connection('knowledge_legacy')->table($table)->delete();
                
                // シーケンスをリセット（PostgreSQL）
                $sequenceName = $this->getSequenceName($table);
                if ($sequenceName) {
                    DB::connection('knowledge_legacy')->statement("ALTER SEQUENCE {$sequenceName} RESTART WITH 1");
                }
            }
        });
    }

    /**
     * ダンプファイルを分析（ドライラン用）
     */
    protected function analyzeDumpFile(string $filePath): array
    {
        $stats = [];
        $handle = fopen($filePath, 'r');
        
        if (!$handle) {
            throw new Exception("Could not open dump file: {$filePath}");
        }
        
        $lineCount = 0;
        
        while (($line = fgets($handle)) !== false) {
            $lineCount++;
            
            if ($lineCount % 500000 === 0) {
                $this->info("  📄 Analyzed {$lineCount} lines...");
            }
            
            $line = trim($line);
            
            // INSERT文をカウント
            if (preg_match('/^INSERT INTO (\w+)/', $line, $matches)) {
                $table = $matches[1];
                $stats[$table] = ($stats[$table] ?? 0) + 1;
            }
        }
        
        fclose($handle);
        
        $this->info("  ✅ Analyzed {$lineCount} lines total");
        
        return $stats;
    }

    /**
     * ストリーミングでデータをインポート
     */
    protected function importDataStreaming(string $filePath): void
    {
        // メモリ制限を増加
        ini_set('memory_limit', '1G');
        
        $handle = fopen($filePath, 'r');
        
        if (!$handle) {
            throw new Exception("Could not open dump file: {$filePath}");
        }
        
        $currentStatement = '';
        $lineCount = 0;
        $importCount = 0;
        $batchSize = 100; // バッチサイズを小さくしてメモリ使用量を抑制
        $batch = [];
        $transactionSize = 500; // トランザクション内の文数を制限
        $transactionCount = 0;
        
        $this->info('📖 Processing dump file with streaming...');
        
        while (($line = fgets($handle)) !== false) {
            $lineCount++;
            
            if ($lineCount % 100000 === 0) {
                $this->info("  📄 Processed {$lineCount} lines, imported {$importCount} statements...");
                // メモリ使用量を表示
                $memoryUsage = memory_get_usage(true) / 1024 / 1024;
                $this->info("  💾 Memory usage: {$memoryUsage} MB");
            }
            
            $line = trim($line);
            
            // 不要な行をスキップ
            if (empty($line) || 
                str_starts_with($line, '--') || 
                str_starts_with($line, '/*') ||
                str_starts_with($line, 'COPY ') ||
                str_starts_with($line, '\\') ||
                str_starts_with($line, 'SET ') ||
                str_starts_with($line, 'SELECT ') ||
                str_starts_with($line, 'CREATE ') ||
                str_starts_with($line, 'ALTER ') ||
                str_starts_with($line, 'DROP ')) {
                continue;
            }
            
            $currentStatement .= $line . "\n";
            
            // INSERT文の終了を検出
            if (str_ends_with($line, ');')) {
                if (!empty(trim($currentStatement)) && str_contains($currentStatement, 'INSERT INTO')) {
                    try {
                        $processedStatement = $this->processStatement($currentStatement);
                        if ($processedStatement) {
                            $batch[] = $processedStatement;
                            
                            // バッチサイズに達したら実行
                            if (count($batch) >= $batchSize) {
                                $this->executeBatchWithTransaction($batch);
                                $importCount += count($batch);
                                $transactionCount += count($batch);
                                $batch = [];
                                
                                // 大きなトランザクションを避けるため、定期的にコミット
                                if ($transactionCount >= $transactionSize) {
                                    $this->info("  🔄 Processed {$transactionCount} statements, continuing...");
                                    $transactionCount = 0;
                                    // ガベージコレクションを手動実行
                                    gc_collect_cycles();
                                }
                            }
                        }
                    } catch (Exception $e) {
                        $this->warn("Warning: Failed to process statement: " . substr($currentStatement, 0, 100) . "...");
                        $this->warn("Error: " . $e->getMessage());
                    }
                }
                $currentStatement = '';
            }
        }
        
        // 残りのバッチを実行
        if (!empty($batch)) {
            $this->executeBatchWithTransaction($batch);
            $importCount += count($batch);
        }
        
        fclose($handle);
        
        $this->info("  ✅ Processed {$lineCount} lines, imported {$importCount} statements total");
    }

    /**
     * バッチ実行
     */
    protected function executeBatch(array $statements): void
    {
        foreach ($statements as $statement) {
            try {
                DB::connection('knowledge_legacy')->statement($statement);
            } catch (Exception $e) {
                $this->warn("Warning: Failed to execute statement: " . substr($statement, 0, 100) . "...");
                $this->warn("Error: " . $e->getMessage());
            }
        }
    }

    /**
     * トランザクション付きバッチ実行（エラー耐性向上）
     */
    protected function executeBatchWithTransaction(array $statements): void
    {
        try {
            DB::connection('knowledge_legacy')->transaction(function() use ($statements) {
                foreach ($statements as $statement) {
                    DB::connection('knowledge_legacy')->statement($statement);
                }
            });
        } catch (Exception $e) {
            // トランザクションが失敗した場合は、個別に実行してエラーを特定
            $this->warn("Batch transaction failed, trying individual statements...");
            
            foreach ($statements as $statement) {
                try {
                    DB::connection('knowledge_legacy')->statement($statement);
                } catch (Exception $individualError) {
                    $this->warn("Warning: Failed to execute statement: " . substr($statement, 0, 100) . "...");
                    $this->warn("Error: " . $individualError->getMessage());
                }
            }
        }
    }


    /**
     * SQL文を処理（カラム調整など）
     */
    protected function processStatement(string $statement): ?string
    {
        // usersテーブルの場合、Laravel特有のカラムを追加
        if (preg_match('/INSERT INTO users/', $statement)) {
            // remember_token, email_verified_at を NULL で追加
            $statement = str_replace(
                ') VALUES (',
                ', remember_token, email_verified_at) VALUES (',
                $statement
            );
            $statement = str_replace(
                ') VALUES (',
                ') VALUES (',
                $statement
            );
            $statement = str_replace(
                ');',
                ', NULL, NULL);',
                $statement
            );
        }
        
        return $statement;
    }

    /**
     * インポート後の整合性チェック
     */
    protected function validateImportedData(): void
    {
        $tables = ['knowledges', 'users', 'tags', 'knowledge_tags', 'comments'];
        
        foreach ($tables as $table) {
            $count = DB::connection('knowledge_legacy')->table($table)->count();
            $this->info("  📊 {$table}: {$count} records");
        }
        
        // 関連データの整合性チェック
        $orphanedTags = DB::connection('knowledge_legacy')
            ->table('knowledge_tags as kt')
            ->leftJoin('knowledges as k', 'kt.knowledge_id', '=', 'k.knowledge_id')
            ->leftJoin('tags as t', 'kt.tag_id', '=', 't.tag_id')
            ->whereNull('k.knowledge_id')
            ->orWhereNull('t.tag_id')
            ->count();
            
        if ($orphanedTags > 0) {
            $this->warn("  ⚠️ Found {$orphanedTags} orphaned tag relationships");
        } else {
            $this->info("  ✅ Tag relationships are consistent");
        }
    }

    /**
     * テーブルのシーケンス名を取得
     */
    protected function getSequenceName(string $table): ?string
    {
        $sequences = [
            'knowledges' => 'knowledges_knowledge_id_seq',
            'users' => 'users_user_id_seq',
            'tags' => 'tags_tag_id_seq',
            'comments' => 'comments_comment_no_seq',
            'knowledge_files' => 'knowledge_files_file_no_seq',
        ];
        
        return $sequences[$table] ?? null;
    }

    /**
     * psqlコマンドを使用してデータをインポート（大容量ファイル対応）
     */
    protected function importDataWithPsql(string $filePath): void
    {
        $this->info('🚀 Using psql command for efficient import...');
        
        // 環境変数からDB接続情報を取得
        $dbHost = config('database.connections.pgsql.host');
        $dbPort = config('database.connections.pgsql.port');
        $dbName = config('database.connections.pgsql.database');
        $dbUser = config('database.connections.pgsql.username');
        $dbPassword = config('database.connections.pgsql.password');
        
        // psqlコマンドを構築
        $command = sprintf(
            'PGPASSWORD=%s psql -h %s -p %s -U %s -d %s -f %s',
            escapeshellarg($dbPassword),
            escapeshellarg($dbHost),
            escapeshellarg($dbPort),
            escapeshellarg($dbUser),
            escapeshellarg($dbName),
            escapeshellarg($filePath)
        );
        
        $this->info('💾 Executing psql import...');
        $this->info('📁 File: ' . basename($filePath));
        $this->info('🗄️ Database: ' . $dbName);
        
        // コマンド実行
        $output = [];
        $returnCode = 0;
        
        // 出力を表示するためのリアルタイム実行
        $descriptorspec = [
            0 => ['pipe', 'r'],  // stdin
            1 => ['pipe', 'w'],  // stdout
            2 => ['pipe', 'w'],  // stderr
        ];
        
        $process = proc_open($command, $descriptorspec, $pipes);
        
        if (!is_resource($process)) {
            throw new Exception('Failed to start psql process');
        }
        
        // stdinを閉じる
        fclose($pipes[0]);
        
        // stdout/stderrを非ブロッキングに設定
        stream_set_blocking($pipes[1], false);
        stream_set_blocking($pipes[2], false);
        
        $startTime = time();
        
        while (true) {
            $status = proc_get_status($process);
            
            // 出力を読み取り
            $stdout = stream_get_contents($pipes[1]);
            $stderr = stream_get_contents($pipes[2]);
            
            if (!empty($stdout)) {
                $this->info('📄 ' . trim($stdout));
            }
            
            if (!empty($stderr)) {
                $this->warn('⚠️ ' . trim($stderr));
            }
            
            // 経過時間を表示
            $elapsed = time() - $startTime;
            if ($elapsed > 0 && $elapsed % 30 === 0) {
                $this->info("⏱️ Elapsed: {$elapsed} seconds");
            }
            
            // プロセスが終了した場合
            if (!$status['running']) {
                $returnCode = $status['exitcode'];
                break;
            }
            
            // 少し待つ
            usleep(100000); // 0.1秒
        }
        
        // パイプを閉じる
        fclose($pipes[1]);
        fclose($pipes[2]);
        
        // プロセスを閉じる
        proc_close($process);
        
        $totalTime = time() - $startTime;
        
        if ($returnCode === 0) {
            $this->info("✅ Import completed successfully in {$totalTime} seconds");
        } else {
            throw new Exception("psql import failed with exit code: {$returnCode}");
        }
    }
}