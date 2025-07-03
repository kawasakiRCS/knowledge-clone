<?php

namespace App\Console\Commands;

use App\Models\Knowledge\Knowledge;
use Illuminate\Console\Command;
use Laravel\Scout\Jobs\MakeSearchable;

class IndexKnowledgeCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'knowledge:index 
                           {--fresh : Clear and rebuild the entire search index}
                           {--batch= : Number of records to process at once (default: 100)}
                           {--id= : Index specific knowledge by ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Index knowledge records for search';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $fresh = $this->option('fresh');
        $batch = (int) $this->option('batch') ?: 100;
        $knowledgeId = $this->option('id');

        if ($fresh) {
            $this->info('Clearing existing search index...');
            Knowledge::removeAllFromSearch();
            $this->info('Search index cleared.');
        }

        if ($knowledgeId) {
            $this->indexSingleKnowledge($knowledgeId);
        } else {
            $this->indexAllKnowledges($batch);
        }

        return Command::SUCCESS;
    }

    /**
     * 単一ナレッジをインデックス
     */
    protected function indexSingleKnowledge(int $knowledgeId): void
    {
        $knowledge = Knowledge::find($knowledgeId);
        
        if (!$knowledge) {
            $this->error("Knowledge with ID {$knowledgeId} not found.");
            return;
        }

        $this->info("Indexing knowledge: {$knowledge->title}");
        $knowledge->searchable();
        $this->info('Done.');
    }

    /**
     * 全ナレッジをインデックス
     */
    protected function indexAllKnowledges(int $batch): void
    {
        $total = Knowledge::count();
        $this->info("Indexing {$total} knowledge records in batches of {$batch}...");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        Knowledge::chunk($batch, function ($knowledges) use ($bar) {
            // バッチでインデックス処理
            dispatch(new MakeSearchable($knowledges));
            $bar->advance($knowledges->count());
        });

        $bar->finish();
        $this->newLine();
        $this->info('Knowledge indexing completed.');
    }
}