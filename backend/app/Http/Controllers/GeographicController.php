<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GeographicController extends Controller
{
    public function getRegions()
    {
        try {
            $regions = DB::table('region')
                ->select('id', 'region')
                ->orderBy('region', 'asc')
                ->get();

            return response()->json([
                'regions' => $regions->map(function ($region) {
                    return [
                        'id' => $region->id,
                        'region_code' => (string)$region->id, // ✅ use id as code
                        'region_name' => $region->region      // ✅ match your DB column
                    ];
                })
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve regions', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve regions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCities(Request $request)
    {
        try {
            $regionCode = $request->query('region_code');

            if (!$regionCode) {
                return response()->json([
                    'message' => 'Region code is required'
                ], 400);
            }

            $cities = DB::table('city')
                ->select('id', 'city')
                ->where('region_id', $regionCode)
                ->orderBy('city', 'asc')
                ->get();

            return response()->json([
                'cities' => $cities->map(function ($city) {
                    return [
                        'id' => $city->id,
                        'city_code' => (string)$city->id,
                        'city_name' => $city->city
                    ];
                })
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve cities', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve cities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getBarangays(Request $request)
    {
        try {
            $cityCode = $request->query('city_code');

            if (!$cityCode) {
                return response()->json([
                    'message' => 'City code is required'
                ], 400);
            }

            $barangays = DB::table('barangay')
                ->select('id', 'barangay')
                ->where('city_id', $cityCode)
                ->orderBy('barangay', 'asc')
                ->get();

            return response()->json([
                'barangays' => $barangays->map(function ($barangay) {
                    return [
                        'id' => $barangay->id,
                        'barangay_code' => (string)$barangay->id,
                        'barangay_name' => $barangay->barangay
                    ];
                })
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve barangays', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve barangays',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
