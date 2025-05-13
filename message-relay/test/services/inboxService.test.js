import listenForReplies from '../../services/inboxService';
import { Pool } from 'pg';

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({ rows: [] }),
  })),
}));

describe('listenForReplies', () => {
  let mockChannel;
  let mockPool;

  beforeEach(() => {
    mockPool = new Pool();
    mockChannel = {
      assertQueue: jest.fn().mockResolvedValue(true),
      consume: jest.fn().mockImplementation((queue, callback) => {
        callback({
          content: JSON.stringify({ someKey: 'someValue' }),
          properties: { correlationId: '12345' },
        });
      }),
      ack: jest.fn(),
      nack: jest.fn(),
    };
  });

  it('should assert the queue and consume messages', async () => {
    await listenForReplies(mockPool, mockChannel);

    expect(mockChannel.assertQueue).toHaveBeenCalledWith('inboxQueue', { durable: true });

    expect(mockChannel.consume).toHaveBeenCalledWith('inboxQueue', expect.any(Function));

    expect(mockPool.query).toHaveBeenCalledWith(
      'INSERT INTO inbox (id, topic, payload, consumed, received_datetime) VALUES ($1, $2, $3, $4, $5)',
      ['12345', 'response-topic', { someKey: 'someValue' }, true, expect.any(Date)]
    );

    expect(mockChannel.ack).toHaveBeenCalled();
  });

});
