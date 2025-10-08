<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========================================\n";
echo "Checking Table Structures\n";
echo "========================================\n\n";

try {
    // Check REGION table
    echo "REGION table columns:\n";
    $regionCols = DB::select('DESCRIBE region');
    foreach ($regionCols as $col) {
        echo "  - {$col->Field} ({$col->Type})\n";
    }
    
    echo "\nSample region data:\n";
    $regions = DB::table('region')->limit(3)->get();
    foreach ($regions as $r) {
        print_r($r);
    }
    
    echo "\n----------------------------------------\n\n";
    
    // Check CITY table
    echo "CITY table columns:\n";
    $cityCols = DB::select('DESCRIBE city');
    foreach ($cityCols as $col) {
        echo "  - {$col->Field} ({$col->Type})\n";
    }
    
    echo "\nSample city data:\n";
    $cities = DB::table('city')->limit(3)->get();
    foreach ($cities as $c) {
        print_r($c);
    }
    
    echo "\n----------------------------------------\n\n";
    
    // Check BARANGAY table
    echo "BARANGAY table columns:\n";
    $barangayCols = DB::select('DESCRIBE barangay');
    foreach ($barangayCols as $col) {
        echo "  - {$col->Field} ({$col->Type})\n";
    }
    
    echo "\nSample barangay data:\n";
    $barangays = DB::table('barangay')->limit(3)->get();
    foreach ($barangays as $b) {
        print_r($b);
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
