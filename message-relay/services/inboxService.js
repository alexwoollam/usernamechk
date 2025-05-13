const listenForReplies = async (pool, channel) => {
  
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

export default listenForReplies;