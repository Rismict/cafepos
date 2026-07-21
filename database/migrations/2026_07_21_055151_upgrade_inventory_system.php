<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add Soft Deletes to existing tables
        Schema::table('categories', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('ingredients', function (Blueprint $table) {
            $table->softDeletes();
            // Minimum stock level before triggering a low-stock alert
            $table->decimal('alert_threshold', 10, 2)->default(0)->after('unit'); 
        });

        // 2. Create the Batch Tracking Table (For Expiry & Dynamic Costs)
        Schema::create('ingredient_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_id')->constrained()->onDelete('cascade');
            $table->string('batch_number'); // e.g., BATCH-20260721-01
            $table->decimal('cost_per_unit', 10, 2); // Cost when THIS specific batch was bought
            $table->decimal('initial_quantity', 10, 2);
            $table->decimal('remaining_quantity', 10, 2);
            $table->date('expires_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ingredient_batches');
        
        Schema::table('ingredients', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn('alert_threshold');
        });
        
        Schema::table('products', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};