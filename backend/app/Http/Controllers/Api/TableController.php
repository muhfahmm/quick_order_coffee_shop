<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TableController extends Controller
{
    public function index()
    {
        $tables = Table::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $tables
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'table_number' => 'required|string|max:50',
        ]);

        $table = Table::create([
            'table_number' => $request->table_number,
            'status' => 'available'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Meja berhasil ditambahkan ke database',
            'data' => $table
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $table = Table::findOrFail($id);
        $request->validate([
            'status' => 'required|in:available,occupied'
        ]);

        $table->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status meja diperbarui',
            'data' => $table
        ]);
    }

    public function occupyByNumber(Request $request)
    {
        $request->validate([
            'table_number' => 'required|string'
        ]);

        $tableNum = $request->table_number;
        $table = Table::where('table_number', $tableNum)->first();

        if (!$table && preg_match('/^\d+$/', $tableNum)) {
            $table = Table::where('table_number', "Meja {$tableNum}")->first();
        }

        if ($table) {
            $table->update(['status' => 'occupied']);
            return response()->json([
                'success' => true,
                'message' => 'Status meja berhasil diubah ke terisi',
                'data' => $table
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Meja tidak ditemukan'
        ], 404);
    }

    public function destroy($id)
    {
        $table = Table::findOrFail($id);
        $table->delete();

        return response()->json([
            'success' => true,
            'message' => 'Meja berhasil dihapus dari database'
        ]);
    }
}
