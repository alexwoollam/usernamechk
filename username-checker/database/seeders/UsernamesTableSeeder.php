<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Username;

class UsernamesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Username::create([
            'username' => 'AlexJames',
            'username_lower' => 'alexjames'
        ]);
    }
}
