<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;

class FileServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // ストレージディレクトリを作成
        $this->createStorageDirectories();
    }

    /**
     * 必要なストレージディレクトリを作成
     */
    protected function createStorageDirectories(): void
    {
        $directories = [
            'knowledge-files',
            'thumbnails',
            'temp-files',
        ];

        foreach ($directories as $directory) {
            if (!Storage::disk('private')->exists($directory)) {
                Storage::disk('private')->makeDirectory($directory);
            }
        }
    }
}