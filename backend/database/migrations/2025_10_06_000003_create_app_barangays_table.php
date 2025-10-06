<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barangay', function (Blueprint $table) {
            $table->id();
            $table->string('barangay_code', 50)->unique();
            $table->string('barangay_name', 255);
            $table->string('city_code', 50);
            $table->foreign('city_code')->references('city_code')->on('city')->onDelete('cascade');
            $table->timestamps();
        });

        $barangays = [
            ['barangay_code' => 'binondo', 'barangay_name' => 'Binondo', 'city_code' => 'manila'],
            ['barangay_code' => 'ermita', 'barangay_name' => 'Ermita', 'city_code' => 'manila'],
            ['barangay_code' => 'intramuros', 'barangay_name' => 'Intramuros', 'city_code' => 'manila'],
            ['barangay_code' => 'malate', 'barangay_name' => 'Malate', 'city_code' => 'manila'],
            ['barangay_code' => 'quiapo', 'barangay_name' => 'Quiapo', 'city_code' => 'manila'],
            ['barangay_code' => 'sampaloc', 'barangay_name' => 'Sampaloc', 'city_code' => 'manila'],
            ['barangay_code' => 'san_andres', 'barangay_name' => 'San Andres', 'city_code' => 'manila'],
            ['barangay_code' => 'san_miguel', 'barangay_name' => 'San Miguel', 'city_code' => 'manila'],
            ['barangay_code' => 'san_nicolas', 'barangay_name' => 'San Nicolas', 'city_code' => 'manila'],
            ['barangay_code' => 'santa_ana', 'barangay_name' => 'Santa Ana', 'city_code' => 'manila'],
            ['barangay_code' => 'santa_cruz', 'barangay_name' => 'Santa Cruz', 'city_code' => 'manila'],
            ['barangay_code' => 'tondo', 'barangay_name' => 'Tondo', 'city_code' => 'manila'],

            ['barangay_code' => 'bahay_toro', 'barangay_name' => 'Bahay Toro', 'city_code' => 'quezon'],
            ['barangay_code' => 'batasan_hills', 'barangay_name' => 'Batasan Hills', 'city_code' => 'quezon'],
            ['barangay_code' => 'commonwealth', 'barangay_name' => 'Commonwealth', 'city_code' => 'quezon'],
            ['barangay_code' => 'fairview', 'barangay_name' => 'Fairview', 'city_code' => 'quezon'],
            ['barangay_code' => 'holy_spirit', 'barangay_name' => 'Holy Spirit', 'city_code' => 'quezon'],
            ['barangay_code' => 'kamuning', 'barangay_name' => 'Kamuning', 'city_code' => 'quezon'],
            ['barangay_code' => 'new_era', 'barangay_name' => 'New Era', 'city_code' => 'quezon'],
            ['barangay_code' => 'novaliches', 'barangay_name' => 'Novaliches', 'city_code' => 'quezon'],
            ['barangay_code' => 'tandang_sora', 'barangay_name' => 'Tandang Sora', 'city_code' => 'quezon'],
            ['barangay_code' => 'cubao', 'barangay_name' => 'Cubao', 'city_code' => 'quezon'],
            ['barangay_code' => 'diliman', 'barangay_name' => 'Diliman', 'city_code' => 'quezon'],
            ['barangay_code' => 'loyola_heights', 'barangay_name' => 'Loyola Heights', 'city_code' => 'quezon'],

            ['barangay_code' => 'acmac', 'barangay_name' => 'Acmac', 'city_code' => 'iligan'],
            ['barangay_code' => 'bagong_silang', 'barangay_name' => 'Bagong Silang', 'city_code' => 'iligan'],
            ['barangay_code' => 'bonbonon', 'barangay_name' => 'Bonbonon', 'city_code' => 'iligan'],
            ['barangay_code' => 'buruun', 'barangay_name' => 'Buruun', 'city_code' => 'iligan'],
            ['barangay_code' => 'digkilaan', 'barangay_name' => 'Digkilaan', 'city_code' => 'iligan'],
            ['barangay_code' => 'hinaplanon', 'barangay_name' => 'Hinaplanon', 'city_code' => 'iligan'],
            ['barangay_code' => 'mainit', 'barangay_name' => 'Mainit', 'city_code' => 'iligan'],
            ['barangay_code' => 'mandulog', 'barangay_name' => 'Mandulog', 'city_code' => 'iligan'],
            ['barangay_code' => 'pala_o', 'barangay_name' => 'Pala-o', 'city_code' => 'iligan'],
            ['barangay_code' => 'poblacion', 'barangay_name' => 'Poblacion', 'city_code' => 'iligan'],
            ['barangay_code' => 'santa_elena', 'barangay_name' => 'Santa Elena', 'city_code' => 'iligan'],
            ['barangay_code' => 'santiago_iligan', 'barangay_name' => 'Santiago', 'city_code' => 'iligan'],
            ['barangay_code' => 'suarez', 'barangay_name' => 'Suarez', 'city_code' => 'iligan'],
            ['barangay_code' => 'tambacan', 'barangay_name' => 'Tambacan', 'city_code' => 'iligan'],
            ['barangay_code' => 'tipanoy', 'barangay_name' => 'Tipanoy', 'city_code' => 'iligan'],
            ['barangay_code' => 'tubod', 'barangay_name' => 'Tubod', 'city_code' => 'iligan'],
            ['barangay_code' => 'upper_hinaplanon', 'barangay_name' => 'Upper Hinaplanon', 'city_code' => 'iligan'],
        ];

        foreach ($barangays as $barangay) {
            DB::table('barangay')->insert([
                'barangay_code' => $barangay['barangay_code'],
                'barangay_name' => $barangay['barangay_name'],
                'city_code' => $barangay['city_code'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('barangay');
    }
};
