<?php

namespace App\Console\Commands;

use App\Models\ParentAccount;
use Illuminate\Console\Command;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

final class ParentService extends Command
{
    protected $signature = 'parent-service:listen';

    public function handle(): void
    {
        $connection = new AMQPStreamConnection(
            env('RABBITMQ_HOST', 'rabbitmq'),
            5672,
            env('RABBITMQ_USER', 'guest'),
            env('RABBITMQ_PASSWORD', 'guest')
        );

        $channel = $connection->channel();

        $channel->queue_declare('accounts.parent.created', false, true, false, false);

        $callback = function (AMQPMessage $msg): void {
            $data = json_decode($msg->getBody(), true);

            if (! $data || ! isset($data['email'], $data['first_name'], $data['last_name'])) {
                \Log::error('Invalid parent creation data received', ['data' => $data]);
                return;
            }

            $parentData = [
                'email' => $data['email'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'password' => $data['password'], // Already hashed!
            ];

            try {
                ParentAccount::updateOrCreate(
                    ['email' => $parentData['email']],
                    $parentData
                );

                \Log::info('Parent account created or updated', ['email' => $parentData['email']]);
            } catch (\Throwable $e) {
                \Log::error('Failed to create parent account', [
                    'error' => $e->getMessage(),
                    'data' => $parentData,
                ]);
            }
        };

        $channel->basic_consume('accounts.parent.created', '', false, true, false, false, $callback);

        while ($channel->is_consuming()) {
            $channel->wait();
        }
    }
}
