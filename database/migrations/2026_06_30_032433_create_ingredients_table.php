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
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Espresso Beans, Fresh Milk
            $table->decimal('stock', 10, 2)->default(0.00); // e.g., 5000.00 grams
            $table->string('unit'); // e.g., grams, ml, pcs
            $table->decimal('cost_per_unit', 10, 2); // To calculate exact COGS
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingredients');
    }
};
