<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('items')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:tb_products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $orderCode = 'ORD-' . strtoupper(Str::random(6));

        $tableNum = $request->table_number ?? 'Meja General';

        $order = Order::create([
            'order_code' => $orderCode,
            'table_id' => $request->table_id ?? null,
            'table_number' => $tableNum,
            'customer_name' => $request->customer_name,
            'total_amount' => 0,
            'status' => 'pending'
        ]);

        // Auto update table status to occupied when order is placed
        if ($request->table_id) {
            \App\Models\Table::where('id', $request->table_id)->update(['status' => 'occupied']);
        } elseif ($tableNum && $tableNum !== 'Meja General') {
            $rawNumber = trim($tableNum);
            $cleanNumber = preg_replace('/^meja\s*/i', '', $rawNumber);
            \App\Models\Table::where('table_number', $rawNumber)
                ->orWhere('table_number', $cleanNumber)
                ->orWhere('table_number', "Meja {$cleanNumber}")
                ->update(['status' => 'occupied']);
        }

        $total = 0;
        foreach ($request->items as $item) {
            $product = \App\Models\Product::find($item['product_id']);
            if ($product) {
                $subtotal = $product->price * $item['quantity'];
                $total += $subtotal;
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'variant_type' => $item['variant_type'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'subtotal' => $subtotal
                ]);
            }
        }

        $order->update(['total_amount' => $total]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat di database',
            'data' => $order->load('items')
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui',
            'data' => $order
        ]);
    }
}
