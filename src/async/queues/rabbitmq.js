/**
 * RabbitMQ Configuration and Connection Manager
 *
 * This module provides RabbitMQ connection management and queue setup
 * for the asynchronous processing system.
 */

const amqp = require('amqplib');
const EventEmitter = require('events');

class RabbitMQManager extends EventEmitter {
  constructor() {
    super();
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5 seconds
  }

  /**
   * Initialize RabbitMQ connection
   */
  async initialize() {
    if (this.isConnected) {
      return;
    }

    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Set up quality of service
      await this.channel.prefetch(10); // Process up to 10 messages concurrently

      this.isConnected = true;
      this.reconnectAttempts = 0;

      console.log('RabbitMQ connection established');

      // Set up event handlers
      this.connection.on('close', () => {
        console.warn('RabbitMQ connection closed');
        this.isConnected = false;
        this.emit('disconnected');
        this._attemptReconnect();
      });

      this.connection.on('error', (error) => {
        console.error('RabbitMQ connection error:', error);
        this.emit('error', error);
      });

      // Set up queues
      await this._setupQueues();
    } catch (error) {
      console.error('Failed to initialize RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Set up required queues
   */
  async _setupQueues() {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    // Content verification queue
    await this.channel.assertQueue('content_verification', {
      durable: true,
      maxLength: 10000 // Limit queue size
    });

    // Batch processing queue
    await this.channel.assertQueue('batch_processing', {
      durable: true,
      maxLength: 5000
    });

    // RUV profile processing queue
    await this.channel.assertQueue('ruv_profile_processing', {
      durable: true,
      maxLength: 5000
    });

    // High priority tasks queue
    await this.channel.assertQueue('high_priority', {
      durable: true,
      maxLength: 1000,
      messageTtl: 300000 // 5 minutes TTL
    });

    // Dead letter exchange for failed messages
    await this.channel.assertExchange('failed_messages', 'fanout', { durable: true });
    await this.channel.assertQueue('failed_messages_queue', { durable: true });
    await this.channel.bindQueue('failed_messages_queue', 'failed_messages', '');

    console.log('RabbitMQ queues initialized');
  }

  /**
   * Send a message to a queue
   * @param {string} queueName - Name of the queue
   * @param {Object} message - Message to send
   * @param {Object} options - Publishing options
   */
  async sendToQueue(queueName, message, options = {}) {
    if (!this.isConnected || !this.channel) {
      throw new Error('RabbitMQ not connected');
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
        messageId: this._generateMessageId()
      }));

      const publishOptions = {
        persistent: true,
        contentType: 'application/json',
        ...options
      };

      return this.channel.sendToQueue(queueName, messageBuffer, publishOptions);
    } catch (error) {
      console.error(`Failed to send message to queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Consume messages from a queue
   * @param {string} queueName - Name of the queue
   * @param {Function} handler - Message handler function
   */
  async consumeQueue(queueName, handler) {
    if (!this.isConnected || !this.channel) {
      throw new Error('RabbitMQ not connected');
    }

    try {
      await this.channel.consume(queueName, async(msg) => {
        if (msg !== null) {
          try {
            const message = JSON.parse(msg.content.toString());

            await handler(message, msg);
            this.channel.ack(msg);
          } catch (error) {
            console.error(`Error processing message from queue ${queueName}:`, error);

            // Reject and potentially requeue the message
            this.channel.nack(msg, false, msg.fields.redelivered ? false : true);

            // If message has been redelivered, send to dead letter queue
            if (msg.fields.redelivered) {
              this.emit('message.failed', {
                queue: queueName,
                message: JSON.parse(msg.content.toString()),
                error: error.message
              });
            }
          }
        }
      });
    } catch (error) {
      console.error(`Failed to consume queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics() {
    if (!this.isConnected || !this.channel) {
      throw new Error('RabbitMQ not connected');
    }

    try {
      const queues = ['content_verification', 'batch_processing', 'ruv_profile_processing', 'high_priority'];
      const metrics = {};

      for (const queue of queues) {
        const queueInfo = await this.channel.checkQueue(queue);

        metrics[queue] = {
          messageCount: queueInfo.messageCount,
          consumerCount: queueInfo.consumerCount
        };
      }

      return metrics;
    } catch (error) {
      console.error('Failed to get queue metrics:', error);
      throw error;
    }
  }

  /**
   * Close RabbitMQ connection
   */
  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }

  /**
   * Attempt to reconnect to RabbitMQ
   */
  async _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached. Giving up.');
      this.emit('reconnect.failed');

      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect to RabbitMQ (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(async() => {
      try {
        await this.initialize();
        this.emit('reconnected');
        console.log('Successfully reconnected to RabbitMQ');
      } catch (error) {
        console.error('Reconnection failed:', error);
        this._attemptReconnect();
      }
    }, this.reconnectDelay);
  }

  /**
   * Generate a unique message ID
   */
  _generateMessageId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
module.exports = new RabbitMQManager();
