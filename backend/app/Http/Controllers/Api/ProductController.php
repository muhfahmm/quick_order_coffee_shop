<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:tb_categories,id',
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable',
            'is_available' => 'boolean',
            'temperature_type' => 'nullable|in:both,hot_only,ice_only,none'
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $imagePath = url('storage/' . $path);
        } elseif (is_string($request->image)) {
            $imagePath = $request->image;
        }

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'image' => $imagePath,
            'is_available' => $request->is_available ?? true,
            'temperature_type' => $request->temperature_type ?? 'both'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Produk menu baru berhasil ditambahkan ke database',
            'data' => $product->load('category')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'category_id' => 'sometimes|required|exists:tb_categories,id',
            'name' => 'sometimes|required|string|max:150',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'image' => 'nullable',
            'is_available' => 'boolean',
            'temperature_type' => 'nullable|in:both,hot_only,ice_only,none'
        ]);

        $data = $request->only(['category_id', 'name', 'description', 'price', 'is_available', 'temperature_type']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image'] = url('storage/' . $path);
        } elseif (is_string($request->image) && !empty($request->image)) {
            $data['image'] = $request->image;
        }

        $product->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Data produk berhasil diperbarui',
            'data' => $product->load('category')
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil dihapus dari database'
        ]);
    }
}
