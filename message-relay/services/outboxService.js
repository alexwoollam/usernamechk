const pollOutbox = async (pool, channel) => {
  try {
    const result = await pool.query(
      'SELECT id, topic, payload FROM outbox WHERE sent = false LIMIT 10'
    );

    if (result.rows.length === 0) {
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

export default pollOutbox;