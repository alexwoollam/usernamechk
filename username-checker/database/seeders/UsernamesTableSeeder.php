<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use App\Models\Username;

class UsernamesTableSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/usernames.txt');

        if (!File::exists($path)) {
            throw new \Exception('Username list file not found.');
        }

        $handle = fopen($path, 'r');

        if (!$handle) {
            throw new \Exception('Unable to open the usernames file.');
        }

        $count = 0;

       while (($line = fgets($handle)) !== false) {
            $name = trim($line);

            if ($name !== '' && strtolower($name) !== 'null') {
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
                    // Duplicate or other DB error, skip it
                    continue;
                }
            }
        }


        fclose($handle);

        echo 'Total inserted: ' . $count . PHP_EOL;
    }
}
