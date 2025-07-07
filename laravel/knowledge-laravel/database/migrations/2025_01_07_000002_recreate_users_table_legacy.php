<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 既存のユーザーデータを保存
        $existingUsers = DB::table('users')->get();
        
        // 既存のusersテーブルを削除
        Schema::dropIfExists('users');
        
        // レガシー構造のusersテーブルを作成
        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('user_key')->unique();
            $table->string('user_name');
            $table->string('password');
            $table->string('salt')->nullable();
            $table->string('mail_address')->unique();
            $table->integer('auth_ldap')->default(0);
            $table->string('remember_token', 100)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->index('user_key');
            $table->index('mail_address');
            $table->index('delete_flag');
        });
        
        // 既存データを新しい構造にマイグレート
        foreach ($existingUsers as $user) {
            DB::table('users')->insert([
                'user_id' => $user->id,
                'user_key' => 'user' . $user->id,
                'user_name' => $user->name,
                'password' => $user->password,
                'salt' => null,
                'mail_address' => $user->email,
                'auth_ldap' => 0,
                'remember_token' => $user->remember_token,
                'email_verified_at' => $user->email_verified_at,
                'insert_user' => $user->id,
                'insert_datetime' => $user->created_at ?: now(),
                'update_user' => $user->id,
                'update_datetime' => $user->updated_at ?: now(),
                'delete_flag' => null,
            ]);
        }
        
        // groupsテーブル
        Schema::create('groups', function (Blueprint $table) {
            $table->id('group_id');
            $table->string('group_key')->unique();
            $table->string('group_name');
            $table->string('description')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });
        
        // user_groupsテーブル
        Schema::create('user_groups', function (Blueprint $table) {
            $table->integer('user_id');
            $table->integer('group_id');
            $table->integer('insert_user');
            $table->timestamp('insert_datetime')->useCurrent();
            $table->integer('update_user');
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            
            $table->primary(['user_id', 'group_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 既存のユーザーデータを保存
        $existingUsers = DB::table('users')->get();
        
        Schema::dropIfExists('user_groups');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('users');
        
        // 標準のLaravelユーザーテーブルを再作成
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
        
        // データを戻す
        foreach ($existingUsers as $user) {
            DB::table('users')->insert([
                'id' => $user->user_id,
                'name' => $user->user_name,
                'email' => $user->mail_address,
                'email_verified_at' => $user->email_verified_at,
                'password' => $user->password,
                'remember_token' => $user->remember_token,
                'created_at' => $user->insert_datetime,
                'updated_at' => $user->update_datetime,
            ]);
        }
    }
};