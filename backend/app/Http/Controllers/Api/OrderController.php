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

        $tableNumber = $request->table_number ?? 'Meja General';
        $tableId = $request->table_id ?? null;

        $table = null;
        if ($tableId) {
            $table = \App\Models\Table::find($tableId);
        } elseif ($tableNumber && $tableNumber !== 'Meja General' && $tableNumber !== 'Online / Delivery' && $tableNumber !== 'Online Order') {
            $table = \App\Models\Table::where('table_number', $tableNumber)->first();
        }

        if ($table) {
            $tableId = $table->id;
            $tableNumber = $table->table_number;
            $table->update(['status' => 'occupied']);
        }

        $order = Order::create([
            'order_code' => $orderCode,
            'table_id' => $tableId,
            'table_number' => $tableNumber,
            'customer_name' => $request->customer_name,
            'total_amount' => 0,
            'status' => 'pending'
        ]);

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

        // Auto update status meja terkait
        $table = null;
        if ($order->table_id) {
            $table = \App\Models\Table::find($order->table_id);
        } elseif ($order->table_number) {
            $table = \App\Models\Table::where('table_number', $order->table_number)->first();
        }

        if ($table) {
            if (in_array($request->status, ['completed', 'cancelled'])) {
                // Periksa apakah masih ada pesanan aktif lain (pending / processing) di meja ini
                $hasActiveOrders = Order::where(function ($q) use ($table) {
                        $q->where('table_id', $table->id)
                          ->orWhere('table_number', $table->table_number);
                    })
                    ->where('id', '!=', $order->id)
                    ->whereIn('status', ['pending', 'processing'])
                    ->exists();

                if (!$hasActiveOrders) {
                    $table->update(['status' => 'available']);
                }
            } elseif (in_array($request->status, ['pending', 'processing'])) {
                $table->update(['status' => 'occupied']);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui',
            'data' => $order
        ]);
    }
}
