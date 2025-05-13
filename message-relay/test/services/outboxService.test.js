import pollOutbox from '../../services/outboxService';

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
  })),
}));

describe('pollOutbox', () => {
  let mockPool;
  let mockChannel;

  beforeEach(() => {
    mockPool = new (require('pg').Pool)();
    mockChannel = {
      sendToQueue: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return early if no unprocessed records are found', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] });

    await pollOutbox(mockPool, mockChannel);

    expect(mockPool.query).toHaveBeenCalledWith(
      'SELECT id, topic, payload FROM outbox WHERE sent = false LIMIT 10'
    );

    expect(mockChannel.sendToQueue).not.toHaveBeenCalled();
  });

  it('should send messages to RabbitMQ and update the database', async () => {
    const mockRow = {
      id: '123',
      topic: 'response-topic',
      payload: { someKey: 'someValue' },
    };

    mockPool.query
      .mockResolvedValueOnce({ rows: [mockRow] }) 
      .mockResolvedValueOnce({ rows: [] });

    await pollOutbox(mockPool, mockChannel);

    expect(mockPool.query).toHaveBeenCalledWith(
      'SELECT id, topic, payload FROM outbox WHERE sent = false LIMIT 10'
    );

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      mockRow.topic,
      Buffer.from(JSON.stringify(mockRow.payload)),
      {
        persistent: true,
        correlationId: mockRow.id,
        replyTo: 'inboxQueue',
      }
    );

    expect(mockPool.query).toHaveBeenCalledWith(
      'UPDATE outbox SET sent = true, sent_datetime = NOW() WHERE id = $1',
      [mockRow.id]
    );
  });

  it('should handle errors during polling gracefully', async () => {
    mockPool.query.mockRejectedValueOnce(new Error('Database query failed'));

    await pollOutbox(mockPool, mockChannel);

    expect(console.error).toHaveBeenCalledWith(
      'Error during polling or sending to RabbitMQ:',
      expect.any(Error)
    );

    expect(mockChannel.sendToQueue).not.toHaveBeenCalled();
  });

  it('should handle errors when sending to RabbitMQ', async () => {
    const mockRow = {
      id: '123',
      topic: 'response-topic',
      payload: { someKey: 'someValue' },
    };

    mockPool.query
      .mockResolvedValueOnce({ rows: [mockRow] })
      .mockResolvedValueOnce({ rows: [] });

    mockChannel.sendToQueue.mockRejectedValueOnce(new Error('RabbitMQ send failed'));

    await pollOutbox(mockPool, mockChannel);

    expect(console.error).toHaveBeenCalledWith(
      'Error during polling or sending to RabbitMQ:',
      expect.any(Error)
    );

    expect(mockPool.query).not.toHaveBeenCalledWith(
      'UPDATE outbox SET sent = true, sent_datetime = NOW() WHERE id = $1',
      [mockRow.id]
    );
  });
});
