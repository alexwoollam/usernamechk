<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use App\Models\Username;
use Faker\Factory as Faker;

class UsernamesTableSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/usernames.txt');

        $usernames = [];

        if (File::exists($path)) {
            $handle = fopen($path, 'r');

            if (!$handle) {
                throw new \Exception('Unable to open the usernames file.');
            }

            while (($line = fgets($handle)) !== false) {
                $name = trim($line);

                if ($name !== '' && strtolower($name) !== 'null') {
                    $usernames[] = $name;
                }
            }

            fclose($handle);
        } else {
            \Log::notice('Username list file not found, fallback to minilist.');

            $faker = Faker::create();

            $usernames = [
                'alexjames',
                'admin',
            ];

            for ($i = 0; $i < 8; $i++) {
                $usernames[] = $faker->userName();
            }
        }

        $count = 0;

        foreach ($usernames as $name) {
            try {
                Username::create([
                    'username' => $name,
                    'username_lower' => strtolower($name)
                ]);
                $count++;

                if ($count % 1000 === 0) {
                    echo 'Inserted: ' . $count . PHP_EOL;
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        echo 'Total inserted: ' . $count . PHP_EOL;
    }
}
