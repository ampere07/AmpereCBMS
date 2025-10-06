<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('region', function (Blueprint $table) {
            $table->id();
            $table->string('region_code', 50)->unique();
            $table->string('region_name', 255);
            $table->timestamps();
        });

        DB::table('region')->insert([
            ['region_code' => 'NCR', 'region_name' => 'National Capital Region (NCR)', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'CAR', 'region_name' => 'Cordillera Administrative Region (CAR)', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R1', 'region_name' => 'Region 1 - Ilocos Region', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R2', 'region_name' => 'Region 2 - Cagayan Valley', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R3', 'region_name' => 'Region 3 - Central Luzon', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R4A', 'region_name' => 'Region 4A - CALABARZON', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R4B', 'region_name' => 'Region 4B - MIMAROPA', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R5', 'region_name' => 'Region 5 - Bicol Region', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R6', 'region_name' => 'Region 6 - Western Visayas', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R7', 'region_name' => 'Region 7 - Central Visayas', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R8', 'region_name' => 'Region 8 - Eastern Visayas', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R9', 'region_name' => 'Region 9 - Zamboanga Peninsula', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R10', 'region_name' => 'Region 10 - Northern Mindanao', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R11', 'region_name' => 'Region 11 - Davao Region', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R12', 'region_name' => 'Region 12 - SOCCSKSARGEN', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'R13', 'region_name' => 'Region 13 - Caraga', 'created_at' => now(), 'updated_at' => now()],
            ['region_code' => 'BARMM', 'region_name' => 'Bangsamoro Autonomous Region in Muslim Mindanao', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('region');
    }
};
