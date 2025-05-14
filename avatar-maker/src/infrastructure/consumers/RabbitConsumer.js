const amqp = require('amqplib')

class RabbitConsumer {
  constructor(creator, queue) {
    this.creator = creator
    this.queue = queue
  }

  async start() {
    const conn = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`)
    const channel = await conn.createChannel()
    await channel.assertQueue(this.queue)

    const responseQueue = 'avatar.creation.completed'

    channel.consume(this.queue, async msg => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString())
          const imageUrl = await this.creator.create(content)

          const replyTo = msg.properties.replyTo
          const correlationId = msg.properties.correlationId

          if (replyTo && correlationId) {
            const responseMsg = {
              imageUrl
            }

            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(responseMsg)), {
              correlationId
            })
          }

          channel.ack(msg)
        } catch (err) {
          console.error('Failed to process message', err)
          channel.nack(msg, false, false)
        }
      }
    })
  }
}

module.exports = RabbitConsumer
