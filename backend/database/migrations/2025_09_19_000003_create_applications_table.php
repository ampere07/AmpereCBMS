<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('mobile');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_initial')->nullable();
            $table->string('secondary_mobile')->nullable();
            
            // Location information
            $table->string('region');
            $table->string('city');
            $table->string('barangay');
            $table->text('installation_address');
            $table->string('landmark');
            $table->string('nearest_landmark1');
            $table->string('nearest_landmark2');
            
            // Plan selection
            $table->string('plan');
            $table->string('promo')->default('None');
            
            // Document paths
            $table->string('proof_of_billing_path')->nullable();
            $table->string('government_id_primary_path')->nullable();
            $table->string('government_id_secondary_path')->nullable();
            $table->string('house_front_picture_path')->nullable();
            
            // Status fields
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            
            // Standard timestamps
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('applications');
    }
};
