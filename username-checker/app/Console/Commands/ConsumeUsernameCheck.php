<?php

namespace App\Console\Commands;

use App\Services\UsernameCacheService;
use Illuminate\Console\Command;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use Illuminate\Support\Facades\DB;
use App\Models\Username;

final class ConsumeUsernameCheck extends Command
{
    protected $signature = 'username-check:listen';

    public function handle(): void
    {
        $connection = new AMQPStreamConnection(
            env('RABBITMQ_HOST', 'rabbitmq'),
            5672,
            'guest',
            'guest'
        );

        $channel = $connection->channel();
        $channel->queue_declare('username.check.requested', false, true, false, false);

        $service = new UsernameCacheService();

        $callback = function (AMQPMessage $msg) use ($service, $channel) {
            $data = json_decode($msg->getBody(), true);
            $username = $data['username'];

            \Log::info('Username check requested', ['username' => $username]);
            \Log::info('Replying to', [
                'reply_to' => $msg->get('reply_to'),
                'correlation_id' => $msg->get('correlation_id')
            ]);

            if (!$username) {
                return;
            }

            if ($service->existsInBloom($username)) {
                $suggestions = $this->getUsernameSuggestions($username);
                $this->emitReply($channel, $msg, false, $username, 'existsInBloom', $suggestions);
                $service->cacheResult($username, true);
                return;
            }

            if ($service->existsInCache($username)) {
                $this->emitReply($channel, $msg, !$service->existsInCache($username), $username, 'existsInCache');
                return;
            }

            $exists = Username::where('username', $username)->exists();

            if ($exists) {
                $service->addToBloom($username);
                $suggestions = $this->getUsernameSuggestions($username);
                $service->cacheResult($username, false);
                $this->emitReply($channel, $msg, false, $username, 'existsInDB', $suggestions);
            } else {
                $service->cacheResult($username, true);
                $this->emitReply($channel, $msg, true, $username, 'notInDB');
            }
        };

        $channel->basic_consume('username.check.requested', '', false, true, false, false, $callback);

        while ($channel->is_consuming()) {
            $channel->wait();
        }
    }

    private function emitReply($channel, AMQPMessage $msg, bool $available, string $username, string $checkType, array $suggestions = []): void
    {
        $replyTo = $msg->get('reply_to');
        $correlationId = $msg->get('correlation_id');

        if (!$replyTo || !$correlationId) {
            return;
        }

        $response = json_encode([
            'username' => $username,
            'available' => $available,
            'check_type' => $checkType,
            'suggestions' => $suggestions 
        ]);

        $responseMsg = new AMQPMessage($response, [
            'correlation_id' => $correlationId
        ]);

        $channel->basic_publish($responseMsg, '', $replyTo);
    }

    private function getUsernameSuggestions(string $username): array
    {
        \Log::info('Getting suggestions for', ['username' => $username]);
        $url = env('SUGGESTION_ENDPOINT');
        $data = ['username' => $username];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        \Log::info('Gott suggestions for', ['http' => $httpCode, 'resp' => $response]);

        if ($httpCode === 200) {
            $responseData = json_decode($response, true);
            return $responseData['alternative_usernames'] ?? [];
        }

        return [];
    }
}
