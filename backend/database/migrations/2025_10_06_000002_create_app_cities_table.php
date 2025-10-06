<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('city', function (Blueprint $table) {
            $table->id();
            $table->string('city_code', 50)->unique();
            $table->string('city_name', 255);
            $table->string('region_code', 50);
            $table->foreign('region_code')->references('region_code')->on('region')->onDelete('cascade');
            $table->timestamps();
        });

        $cities = [
            ['city_code' => 'manila', 'city_name' => 'Manila', 'region_code' => 'NCR'],
            ['city_code' => 'quezon', 'city_name' => 'Quezon City', 'region_code' => 'NCR'],
            ['city_code' => 'makati', 'city_name' => 'Makati', 'region_code' => 'NCR'],
            ['city_code' => 'pasig', 'city_name' => 'Pasig', 'region_code' => 'NCR'],
            ['city_code' => 'taguig', 'city_name' => 'Taguig', 'region_code' => 'NCR'],
            ['city_code' => 'pasay', 'city_name' => 'Pasay', 'region_code' => 'NCR'],
            ['city_code' => 'caloocan', 'city_name' => 'Caloocan', 'region_code' => 'NCR'],

            ['city_code' => 'baguio', 'city_name' => 'Baguio City', 'region_code' => 'CAR'],
            ['city_code' => 'la_trinidad', 'city_name' => 'La Trinidad', 'region_code' => 'CAR'],
            ['city_code' => 'bangued', 'city_name' => 'Bangued', 'region_code' => 'CAR'],
            ['city_code' => 'tabuk', 'city_name' => 'Tabuk', 'region_code' => 'CAR'],

            ['city_code' => 'san_fernando_lu', 'city_name' => 'San Fernando City, La Union', 'region_code' => 'R1'],
            ['city_code' => 'laoag', 'city_name' => 'Laoag City', 'region_code' => 'R1'],
            ['city_code' => 'dagupan', 'city_name' => 'Dagupan City', 'region_code' => 'R1'],
            ['city_code' => 'vigan', 'city_name' => 'Vigan City', 'region_code' => 'R1'],

            ['city_code' => 'tuguegarao', 'city_name' => 'Tuguegarao City', 'region_code' => 'R2'],
            ['city_code' => 'ilagan', 'city_name' => 'Ilagan City', 'region_code' => 'R2'],
            ['city_code' => 'cauayan', 'city_name' => 'Cauayan City', 'region_code' => 'R2'],
            ['city_code' => 'santiago', 'city_name' => 'Santiago City', 'region_code' => 'R2'],

            ['city_code' => 'san_fernando_p', 'city_name' => 'San Fernando City, Pampanga', 'region_code' => 'R3'],
            ['city_code' => 'angeles', 'city_name' => 'Angeles City', 'region_code' => 'R3'],
            ['city_code' => 'olongapo', 'city_name' => 'Olongapo City', 'region_code' => 'R3'],
            ['city_code' => 'malolos', 'city_name' => 'Malolos City', 'region_code' => 'R3'],

            ['city_code' => 'calamba', 'city_name' => 'Calamba City', 'region_code' => 'R4A'],
            ['city_code' => 'batangas', 'city_name' => 'Batangas City', 'region_code' => 'R4A'],
            ['city_code' => 'lipa', 'city_name' => 'Lipa City', 'region_code' => 'R4A'],
            ['city_code' => 'antipolo', 'city_name' => 'Antipolo City', 'region_code' => 'R4A'],

            ['city_code' => 'calapan', 'city_name' => 'Calapan City', 'region_code' => 'R4B'],
            ['city_code' => 'puerto_princesa', 'city_name' => 'Puerto Princesa City', 'region_code' => 'R4B'],

            ['city_code' => 'legazpi', 'city_name' => 'Legazpi City', 'region_code' => 'R5'],
            ['city_code' => 'naga', 'city_name' => 'Naga City', 'region_code' => 'R5'],
            ['city_code' => 'sorsogon', 'city_name' => 'Sorsogon City', 'region_code' => 'R5'],

            ['city_code' => 'iloilo', 'city_name' => 'Iloilo City', 'region_code' => 'R6'],
            ['city_code' => 'bacolod', 'city_name' => 'Bacolod City', 'region_code' => 'R6'],
            ['city_code' => 'roxas', 'city_name' => 'Roxas City', 'region_code' => 'R6'],

            ['city_code' => 'cebu', 'city_name' => 'Cebu City', 'region_code' => 'R7'],
            ['city_code' => 'lapu_lapu', 'city_name' => 'Lapu-Lapu City', 'region_code' => 'R7'],
            ['city_code' => 'mandaue', 'city_name' => 'Mandaue City', 'region_code' => 'R7'],
            ['city_code' => 'tagbilaran', 'city_name' => 'Tagbilaran City', 'region_code' => 'R7'],

            ['city_code' => 'tacloban', 'city_name' => 'Tacloban City', 'region_code' => 'R8'],
            ['city_code' => 'ormoc', 'city_name' => 'Ormoc City', 'region_code' => 'R8'],
            ['city_code' => 'catbalogan', 'city_name' => 'Catbalogan City', 'region_code' => 'R8'],

            ['city_code' => 'zamboanga', 'city_name' => 'Zamboanga City', 'region_code' => 'R9'],
            ['city_code' => 'dipolog', 'city_name' => 'Dipolog City', 'region_code' => 'R9'],
            ['city_code' => 'pagadian', 'city_name' => 'Pagadian City', 'region_code' => 'R9'],

            ['city_code' => 'cagayan_de_oro', 'city_name' => 'Cagayan de Oro City', 'region_code' => 'R10'],
            ['city_code' => 'iligan', 'city_name' => 'Iligan City', 'region_code' => 'R10'],
            ['city_code' => 'valencia', 'city_name' => 'Valencia City', 'region_code' => 'R10'],

            ['city_code' => 'davao', 'city_name' => 'Davao City', 'region_code' => 'R11'],
            ['city_code' => 'tagum', 'city_name' => 'Tagum City', 'region_code' => 'R11'],
            ['city_code' => 'digos', 'city_name' => 'Digos City', 'region_code' => 'R11'],

            ['city_code' => 'general_santos', 'city_name' => 'General Santos City', 'region_code' => 'R12'],
            ['city_code' => 'koronadal', 'city_name' => 'Koronadal City', 'region_code' => 'R12'],
            ['city_code' => 'cotabato', 'city_name' => 'Cotabato City', 'region_code' => 'R12'],

            ['city_code' => 'butuan', 'city_name' => 'Butuan City', 'region_code' => 'R13'],
            ['city_code' => 'surigao', 'city_name' => 'Surigao City', 'region_code' => 'R13'],
            ['city_code' => 'tandag', 'city_name' => 'Tandag City', 'region_code' => 'R13'],

            ['city_code' => 'marawi', 'city_name' => 'Marawi City', 'region_code' => 'BARMM'],
            ['city_code' => 'lamitan', 'city_name' => 'Lamitan City', 'region_code' => 'BARMM'],
        ];

        foreach ($cities as $city) {
            DB::table('city')->insert([
                'city_code' => $city['city_code'],
                'city_name' => $city['city_name'],
                'region_code' => $city['region_code'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('city');
    }
};
