<?php

namespace App\Console\Commands;

use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\Tag;
use Illuminate\Console\Command;
use Laravel\Scout\Facades\Scout;

class SearchStatsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'knowledge:search-stats 
                           {--index= : Show stats for specific index}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Show search index statistics';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $index = $this->option('index') ?: 'knowledges';

        $this->info("Search Index Statistics for: {$index}");
        $this->newLine();

        try {
            // Scout統計
            $this->showScoutStats();
            
            // ナレッジ統計
            $this->showKnowledgeStats();
            
            // タグ統計
            $this->showTagStats();

        } catch (\Exception $e) {
            $this->error("Error retrieving search stats: {$e->getMessage()}");
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    /**
     * Scout統計を表示
     */
    protected function showScoutStats(): void
    {
        $this->info('Scout Search Statistics:');
        
        // インデックス済みレコード数
        $indexedCount = Knowledge::count();
        $this->line("- Total Knowledge Records: {$indexedCount}");

        // 検索可能レコード数
        try {
            $searchableCount = Knowledge::search('*')->count();
            $this->line("- Searchable Records: {$searchableCount}");
        } catch (\Exception $e) {
            $this->line("- Searchable Records: Unable to retrieve ({$e->getMessage()})");
        }

        $this->newLine();
    }

    /**
     * ナレッジ統計を表示
     */
    protected function showKnowledgeStats(): void
    {
        $this->info('Knowledge Statistics:');

        // 公開範囲別統計
        $publicStats = Knowledge::selectRaw('public_flag, COUNT(*) as count')
                               ->groupBy('public_flag')
                               ->pluck('count', 'public_flag')
                               ->toArray();

        $this->line('- By Public Flag:');
        foreach ($publicStats as $flag => $count) {
            $flagName = match($flag) {
                0 => 'Private',
                1 => 'Public', 
                2 => 'Protected',
                default => "Unknown ({$flag})"
            };
            $this->line("  {$flagName}: {$count}");
        }

        // テンプレート別統計
        $templateStats = Knowledge::selectRaw('type_id, COUNT(*) as count')
                                 ->whereNotNull('type_id')
                                 ->groupBy('type_id')
                                 ->pluck('count', 'type_id')
                                 ->take(5)
                                 ->toArray();

        if (!empty($templateStats)) {
            $this->line('- Top 5 Templates:');
            foreach ($templateStats as $typeId => $count) {
                $this->line("  Template {$typeId}: {$count}");
            }
        }

        // 作成者別統計（上位5位）
        $creatorStats = Knowledge::selectRaw('insert_user, COUNT(*) as count')
                                ->groupBy('insert_user')
                                ->orderByDesc('count')
                                ->take(5)
                                ->pluck('count', 'insert_user')
                                ->toArray();

        $this->line('- Top 5 Contributors:');
        foreach ($creatorStats as $userId => $count) {
            $this->line("  User {$userId}: {$count}");
        }

        $this->newLine();
    }

    /**
     * タグ統計を表示
     */
    protected function showTagStats(): void
    {
        $this->info('Tag Statistics:');

        $totalTags = Tag::count();
        $this->line("- Total Tags: {$totalTags}");

        // 人気タグトップ10
        $popularTags = Tag::withCount('knowledges')
                         ->orderByDesc('knowledges_count')
                         ->take(10)
                         ->get();

        $this->line('- Top 10 Popular Tags:');
        foreach ($popularTags as $tag) {
            $this->line("  {$tag->tag_name}: {$tag->knowledges_count} knowledges");
        }

        // 未使用タグ
        $unusedTags = Tag::doesntHave('knowledges')->count();
        $this->line("- Unused Tags: {$unusedTags}");

        $this->newLine();
    }
}