import startRelay from './services/relayService.js';
import connectRabbitMQ from './services/rabbitMqService.js';
import listenForReplies from './services/inboxService.js';
import pollOutbox from './services/outboxService.js';
import pool from "./services/dbConnection.js";

const rabbitMQUrl = 'amqp://rabbitmq:5672'

const dbPool = pool;
const { channel } = await connectRabbitMQ(rabbitMQUrl);

const listen = listenForReplies(dbPool, channel);
const outbox = () => pollOutbox(dbPool, channel);

startRelay(listen, outbox, 1000);
