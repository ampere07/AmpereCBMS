<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StorageSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $exists = DB::table('settings_image_size')
            ->where('status', 'active')
            ->exists();
        
        if (!$exists) {
            DB::table('settings_image_size')->insert([
                'image_size_value' => 50,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info('Image size settings seeded successfully (50% resize).');
        } else {
            $this->command->info('Active image size settings already exist.');
        }
    }
}
