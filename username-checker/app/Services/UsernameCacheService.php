<?php

namespace App\Services;

use Predis\Client;

final class UsernameCacheService
{
    private Client $redis;

    public function __construct()
    {
        $this->redis = new Client([
            'scheme' => 'tcp',
            'host'   => env('REDIS_HOST', '127.0.0.1'),
            'port'   => 6379,
        ]);
    }

    public function existsInBloom(string $username): bool
    {
        return (bool) $this->redis->executeRaw(['BF.EXISTS', 'usernames_filter', $username]);
    }

    public function addToBloom(string $username): void
    {
        $this->redis->executeRaw(['BF.ADD', 'usernames_filter', $username]);
    }

    public function existsInCache(string $username): bool
    {
        $result = $this->redis->get('username:availability:' . $username);
        return $result !== null ? (bool) $result : false;
    }

    public function cacheResult(string $username, bool $available): void
    {
        $this->redis->setex('username:availability:' . $username, 300, $available ? '1' : '0');
    }
}
