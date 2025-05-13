import { connectRabbitMQ } from '../../services/rabbitMqService.js';
import amqp from 'amqplib';

jest.mock('amqplib');

describe('connectRabbitMQ', () => {
  let mockConnection;
  let mockChannel;

  beforeEach(() => {
    mockConnection = {
      createChannel: jest.fn(),
    };
    mockChannel = {};
    
    amqp.connect.mockResolvedValue(mockConnection);
    mockConnection.createChannel.mockResolvedValue(mockChannel);

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully connect to RabbitMQ and return connection and channel', async () => {
    const rabbitMQUrl = 'amqp://rabbitmq:5672';
    
    const { connection, channel } = await connectRabbitMQ(rabbitMQUrl);
    
    expect(amqp.connect).toHaveBeenCalledWith(rabbitMQUrl);
    expect(mockConnection.createChannel).toHaveBeenCalled();

    expect(connection).toBe(mockConnection);
    expect(channel).toBe(mockChannel);

    expect(console.log).toHaveBeenCalledWith('Connected to RabbitMQ');
  });
});
