<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Product;
use App\Models\Table;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Admin User
        Admin::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Admin Resto',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // 2. Seed Tables
        for ($i = 1; $i <= 8; $i++) {
            Table::updateOrCreate(
                ['table_number' => "Meja {$i}"],
                ['status' => 'available']
            );
        }

        // 3. Seed Categories
        $catCoffee = Category::updateOrCreate(
            ['slug' => 'coffee'],
            ['name' => 'Espresso & Coffee', 'icon_or_image' => '☕']
        );

        $catNonCoffee = Category::updateOrCreate(
            ['slug' => 'non-coffee'],
            ['name' => 'Non-Coffee & Tea', 'icon_or_image' => '🍵']
        );

        $catFood = Category::updateOrCreate(
            ['slug' => 'food'],
            ['name' => 'Main Course & Snack', 'icon_or_image' => '🍽️']
        );

        $catPastry = Category::updateOrCreate(
            ['slug' => 'pastry'],
            ['name' => 'Pastry & Dessert', 'icon_or_image' => '🥐']
        );

        // 4. Seed Products
        $products = [
            // Coffee Category
            [
                'category_id' => $catCoffee->id,
                'name' => 'Signature Cafe Latte',
                'description' => 'Espresso house blend dipadukan dengan susu segar yang creamy dan lembut.',
                'price' => 28000,
                'image' => 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
                'temperature_type' => 'both',
                'is_available' => true,
                'is_best_seller' => true,
                'is_chef_pick' => false,
            ],
            [
                'category_id' => $catCoffee->id,
                'name' => 'Salted Caramel Macchiato',
                'description' => 'Espresso nikmat dengan sirup vanilla, susu hangat, dan topping saus salted caramel.',
                'price' => 32000,
                'image' => 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
                'temperature_type' => 'both',
                'is_available' => true,
                'is_best_seller' => true,
                'is_chef_pick' => true,
            ],
            [
                'category_id' => $catCoffee->id,
                'name' => 'Americano Black Coffee',
                'description' => 'Ekstrak double shot espresso asli khas Arabika dengan rasa kaya dan harum.',
                'price' => 22000,
                'image' => 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
                'temperature_type' => 'both',
                'is_available' => true,
                'is_best_seller' => false,
                'is_chef_pick' => false,
            ],

            // Non-Coffee Category
            [
                'category_id' => $catNonCoffee->id,
                'name' => 'Matcha Green Tea Latte',
                'description' => 'Bubuk matcha impor khas Uji Jepang dipadukan dengan fresh milk hangat/dingin.',
                'price' => 30000,
                'image' => 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
                'temperature_type' => 'both',
                'is_available' => true,
                'is_best_seller' => true,
                'is_chef_pick' => false,
            ],
            [
                'category_id' => $catNonCoffee->id,
                'name' => 'Red Velvet Signature Drink',
                'description' => 'Minuman red velvet gurih manis nan lezat dengan tekstur lembut.',
                'price' => 29000,
                'image' => 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
                'temperature_type' => 'both',
                'is_available' => true,
                'is_best_seller' => false,
                'is_chef_pick' => false,
            ],
            [
                'category_id' => $catNonCoffee->id,
                'name' => 'Choco Hazelnut Cream',
                'description' => 'Cokelat premium pekat dipadukan dengan aroma hazelnut favorit.',
                'price' => 28000,
                'image' => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
                'temperature_type' => 'both',
                'is_available' => true,
                'is_best_seller' => false,
                'is_chef_pick' => true,
            ],

            // Food Category
            [
                'category_id' => $catFood->id,
                'name' => 'Spaghetti Creamy Carbonara',
                'description' => 'Pasta spaghetti segar disiram saus creamy carbonara dan smoked beef potongan kaya rasa.',
                'price' => 45000,
                'image' => 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
                'temperature_type' => 'none',
                'is_available' => true,
                'is_best_seller' => true,
                'is_chef_pick' => true,
            ],
            [
                'category_id' => $catFood->id,
                'name' => 'Club Sandwich & Fries',
                'description' => 'Roti panggang lapis telur, keju melt, dada ayam fillet, dan kentang goreng renyah.',
                'price' => 38000,
                'image' => 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
                'temperature_type' => 'none',
                'is_available' => true,
                'is_best_seller' => false,
                'is_chef_pick' => false,
            ],
            [
                'category_id' => $catFood->id,
                'name' => 'Truffle French Fries',
                'description' => 'Kentang goreng gurih renyah dengan baluran minyak aroma truffle dan keju parmesan.',
                'price' => 25000,
                'image' => 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
                'temperature_type' => 'none',
                'is_available' => true,
                'is_best_seller' => true,
                'is_chef_pick' => false,
            ],

            // Pastry Category
            [
                'category_id' => $catPastry->id,
                'name' => 'French Butter Croissant',
                'description' => 'Croissant flaking khas Prancis dengan keharuman butter segar yang menggiurkan.',
                'price' => 24000,
                'image' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
                'temperature_type' => 'none',
                'is_available' => true,
                'is_best_seller' => true,
                'is_chef_pick' => false,
            ],
        ];

        foreach ($products as $pData) {
            Product::updateOrCreate(
                ['name' => $pData['name']],
                $pData
            );
        }
    }
}

