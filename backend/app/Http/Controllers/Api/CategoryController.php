<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('products')->get();

        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'icon_or_image' => 'nullable|string'
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'icon_or_image' => $request->icon_or_image
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori menu berhasil ditambahkan',
            'data' => $category
        ], 201);
    }
}
