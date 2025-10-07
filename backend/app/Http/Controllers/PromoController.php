<?php

namespace App\Http\Controllers;

use App\Models\PromoList;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    public function index()
    {
        // Fetch only active promos
        $promos = PromoList::where('status', 'active')->get(['id', 'name', 'status']);

        return response()->json([
            'data' => $promos
        ]);
    }
}
