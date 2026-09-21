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
            'name' => 'nullable|string|max:150',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'image' => 'nullable',
            'hot_name' => 'nullable|string|max:150',
            'hot_image' => 'nullable',
            'hot_price' => 'nullable|numeric|min:0',
            'hot_available' => 'boolean',
            'ice_name' => 'nullable|string|max:150',
            'ice_image' => 'nullable',
            'ice_price' => 'nullable|numeric|min:0',
            'ice_available' => 'boolean',
            'is_available' => 'boolean',
            'temperature_type' => 'nullable|in:both,hot_only,ice_only,none',
            'is_best_seller' => 'nullable|boolean',
            'is_chef_pick' => 'nullable|boolean'
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $imagePath = url('storage/' . $path);
        } elseif (is_string($request->image)) {
            $imagePath = $request->image;
        }

        $hotImagePath = null;
        if ($request->hasFile('hot_image')) {
            $path = $request->file('hot_image')->store('products', 'public');
            $hotImagePath = url('storage/' . $path);
        } elseif (is_string($request->hot_image)) {
            $hotImagePath = $request->hot_image;
        }

        $iceImagePath = null;
        if ($request->hasFile('ice_image')) {
            $path = $request->file('ice_image')->store('products', 'public');
            $iceImagePath = url('storage/' . $path);
        } elseif (is_string($request->ice_image)) {
            $iceImagePath = $request->ice_image;
        }

        $name = $request->name ?: ($request->hot_name ?: ($request->ice_name ?: 'Produk'));
        $price = $request->price ?: ($request->hot_price ?: ($request->ice_price ?: 0));

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $name,
            'description' => $request->description,
            'price' => $price,
            'image' => $imagePath,
            'hot_name' => $request->hot_name,
            'hot_image' => $hotImagePath,
            'hot_price' => $request->hot_price,
            'hot_available' => $request->hot_available ?? true,
            'ice_name' => $request->ice_name,
            'ice_image' => $iceImagePath,
            'ice_price' => $request->ice_price,
            'ice_available' => $request->ice_available ?? true,
            'is_available' => $request->is_available ?? true,
            'temperature_type' => $request->temperature_type ?? 'both',
            'is_best_seller' => filter_var($request->is_best_seller, FILTER_VALIDATE_BOOLEAN),
            'is_chef_pick' => filter_var($request->is_chef_pick, FILTER_VALIDATE_BOOLEAN)
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
            'name' => 'nullable|string|max:150',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'image' => 'nullable',
            'hot_name' => 'nullable|string|max:150',
            'hot_image' => 'nullable',
            'hot_price' => 'nullable|numeric|min:0',
            'hot_available' => 'boolean',
            'ice_name' => 'nullable|string|max:150',
            'ice_image' => 'nullable',
            'ice_price' => 'nullable|numeric|min:0',
            'ice_available' => 'boolean',
            'is_available' => 'boolean',
            'temperature_type' => 'nullable|in:both,hot_only,ice_only,none',
            'is_best_seller' => 'nullable|boolean',
            'is_chef_pick' => 'nullable|boolean'
        ]);

        $data = $request->only(['category_id', 'name', 'description', 'price', 'hot_name', 'hot_price', 'hot_available', 'ice_name', 'ice_price', 'ice_available', 'is_available', 'temperature_type', 'is_best_seller', 'is_chef_pick']);

        if (empty($data['name'])) {
            $data['name'] = $request->hot_name ?: ($request->ice_name ?: $product->name);
        }
        if (!isset($data['price']) || $data['price'] === null || $data['price'] === '') {
            $data['price'] = $request->hot_price ?: ($request->ice_price ?: $product->price);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image'] = url('storage/' . $path);
        } elseif (is_string($request->image) && !empty($request->image)) {
            $data['image'] = $request->image;
        }

        if ($request->hasFile('hot_image')) {
            $path = $request->file('hot_image')->store('products', 'public');
            $data['hot_image'] = url('storage/' . $path);
        } elseif (is_string($request->hot_image) && !empty($request->hot_image)) {
            $data['hot_image'] = $request->hot_image;
        }

        if ($request->hasFile('ice_image')) {
            $path = $request->file('ice_image')->store('products', 'public');
            $data['ice_image'] = url('storage/' . $path);
        } elseif (is_string($request->ice_image) && !empty($request->ice_image)) {
            $data['ice_image'] = $request->ice_image;
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
