import amqp from 'amqplib';
import pool from './dbConnection.js';
import { v4 as uuidv4 } from 'uuid';

const rabbitMQUrl = 'amqp://rabbitmq:5672';

let channel;
let connection;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(rabbitMQUrl);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
  } catch (err) {
    console.error('RabbitMQ connection failed:', err);
    process.exit(1);
  }
};

const pollOutbox = async () => {
  try {
    const result = await pool.query(
      'SELECT id, topic, payload FROM outbox WHERE sent = false LIMIT 10'
    );

    if (result.rows.length === 0) {
      console.log('No messages to process');
      return;
    }

    for (let row of result.rows) {
      const { id, topic, payload } = row;
      const correlationId = id;

      
      await channel.sendToQueue(topic, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
        correlationId,
        replyTo: 'inboxQueue'
      });

      await pool.query(
        'UPDATE outbox SET sent = true, sent_datetime = NOW() WHERE id = $1',
        [id]
      );
    }
  } catch (err) {
    console.error('Error during polling or sending to RabbitMQ:', err);
  }
};

const listenForReplies = async () => {
  
  await channel.assertQueue('inboxQueue', { durable: true });
  channel.consume('inboxQueue', async (msg) => {
    if (!msg || !msg.content) {
      console.warn('Received empty message or missing content'); 
      return;
    }

    try {
      const responsePayload = JSON.parse(msg.content.toString());
      const correlationId = msg.properties?.correlationId || null;


      await pool.query(
        'INSERT INTO inbox (id, topic, payload, consumed, received_datetime) VALUES ($1, $2, $3, $4, $5)',
        [correlationId, 'response-topic', responsePayload, true, new Date()]
      );

      channel.ack(msg);
    } catch (err) {
      console.error('Error handling incoming message:', err);
      channel.nack(msg, false, false);
    }
  });
};

const startRelay = async () => {
  await connectRabbitMQ();
  await listenForReplies();

  setInterval(pollOutbox, 1000);
};

export default startRelay;
