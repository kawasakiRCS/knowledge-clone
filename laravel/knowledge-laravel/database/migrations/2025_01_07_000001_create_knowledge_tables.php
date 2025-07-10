<?php

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
        // knowledgesテーブル
        Schema::create('knowledges', function (Blueprint $table) {
            $table->id('knowledge_id');
            $table->string('title');
            $table->text('content')->nullable();
            $table->integer('public_flag')->default(1);
            $table->string('tag_ids')->nullable();
            $table->string('tag_names')->nullable();
            $table->integer('like_count')->default(0);
            $table->integer('comment_count')->default(0);
            $table->integer('view_count')->default(0);
            $table->integer('type_id')->nullable();
            $table->integer('notify_status')->default(0);
            $table->integer('point')->default(0);
            $table->integer('anonymous')->default(0);
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->index('public_flag');
            $table->index('insert_user');
            $table->index('delete_flag');
        });

        // tagsテーブル
        Schema::create('tags', function (Blueprint $table) {
            $table->id('tag_id');
            $table->string('tag_name')->unique();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // knowledge_tagsテーブル
        Schema::create('knowledge_tags', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('tag_id');
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->primary(['knowledge_id', 'tag_id']);
        });

        // commentsテーブル
        Schema::create('comments', function (Blueprint $table) {
            $table->id('comment_no');
            $table->integer('knowledge_id');
            $table->text('comment');
            $table->integer('comment_status')->default(1);
            $table->integer('anonymous')->default(0);
            $table->integer('like_count')->default(0);
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->index('knowledge_id');
        });

        // likesテーブル
        Schema::create('likes', function (Blueprint $table) {
            $table->id('no');
            $table->integer('knowledge_id');
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->index(['knowledge_id', 'insert_user']);
        });

        // like_commentsテーブル
        Schema::create('like_comments', function (Blueprint $table) {
            $table->id('no');
            $table->integer('comment_no');
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->index(['comment_no', 'insert_user']);
        });

        // view_historiesテーブル
        Schema::create('view_histories', function (Blueprint $table) {
            $table->id('history_no');
            $table->integer('knowledge_id');
            $table->integer('view_user_id');
            $table->timestamp('view_date_time');
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->index(['knowledge_id', 'view_user_id']);
        });

        // knowledge_filesテーブル
        Schema::create('knowledge_files', function (Blueprint $table) {
            $table->id('file_no');
            $table->integer('knowledge_id');
            $table->integer('comment_no')->nullable();
            $table->string('file_name');
            $table->integer('file_size');
            $table->string('file_binary')->nullable();
            $table->string('parse_status')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            $table->integer('draft_id')->nullable(); // Java版との互換性のため追加
            
            $table->index('knowledge_id');
        });

        // template_mastersテーブル
        Schema::create('template_masters', function (Blueprint $table) {
            $table->id('type_id');
            $table->string('type_key')->unique();
            $table->string('type_name');
            $table->string('type_icon')->nullable();
            $table->string('description')->nullable();
            $table->text('init_content')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // knowledge_usersテーブル（アクセス権限）
        Schema::create('knowledge_users', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('user_id');
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->primary(['knowledge_id', 'user_id']);
        });

        // knowledge_groupsテーブル（グループアクセス権限）
        Schema::create('knowledge_groups', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('group_id');
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->primary(['knowledge_id', 'group_id']);
        });

        // knowledge_edit_usersテーブル（編集権限）
        Schema::create('knowledge_edit_users', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('user_id');
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->primary(['knowledge_id', 'user_id']);
        });

        // knowledge_edit_groupsテーブル（グループ編集権限）
        Schema::create('knowledge_edit_groups', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('group_id');
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->primary(['knowledge_id', 'group_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_edit_groups');
        Schema::dropIfExists('knowledge_edit_users');
        Schema::dropIfExists('knowledge_groups');
        Schema::dropIfExists('knowledge_users');
        Schema::dropIfExists('template_masters');
        Schema::dropIfExists('knowledge_files');
        Schema::dropIfExists('view_histories');
        Schema::dropIfExists('like_comments');
        Schema::dropIfExists('likes');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('knowledge_tags');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('knowledges');
    }
};