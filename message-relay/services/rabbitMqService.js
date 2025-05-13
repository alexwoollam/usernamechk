import amqp from 'amqplib';

export const connectRabbitMQ = async (rabbitMQUrl = 'amqp://rabbitmq:5672') => {
    let connection;
    let channel;
    try {
        connection = await amqp.connect(rabbitMQUrl);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (err) {
        console.error('RabbitMQ connection failed:', err);
        process.exit(1);
    }

    return {connection, channel}
};

export default connectRabbitMQ
