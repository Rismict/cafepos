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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Logs WHO did it
            
            // Type of movement: 'restock', 'waste', 'manual_adjustment', 'sale'
            $table->string('type'); 
            
            $table->decimal('quantity_changed', 10, 2); // Positive for restock, negative for waste
            $table->decimal('balance_after', 10, 2); // Snapshot of stock after this action
            $table->string('notes')->nullable(); // e.g., "Spilled milk on floor" or "Supplier Invoice #123"
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
