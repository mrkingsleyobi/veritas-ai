/**
 * Streaming Middleware
 *
 * Provides middleware for handling streaming of large content uploads
 * with progress tracking and memory management.
 */

const { Transform, PassThrough } = require('stream');
const { pipeline } = require('stream/promises');
const { performance } = require('perf_hooks');

class StreamingMiddleware {
  /**
   * Create streaming middleware for large file uploads
   * @param {Object} options - Configuration options
   * @returns {Function} Express middleware
   */
  static streamUpload(options = {}) {
    const {
      maxFileSize = 100 * 1024 * 1024, // 100MB default
      chunkSize = 64 * 1024, // 64KB chunks
      enableProgress = true
    } = options;

    return (req, res, next) => {
      // Only handle multipart/form-data
      if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
        return next();
      }

      // Track upload progress
      let uploadedBytes = 0;
      const startTime = performance.now();

      // Create a pass-through stream to monitor data flow
      const monitorStream = new PassThrough({
        highWaterMark: chunkSize
      });

      // Monitor data flow
      monitorStream.on('data', (chunk) => {
        uploadedBytes += chunk.length;

        // Check file size limit
        if (uploadedBytes > maxFileSize) {
          const error = new Error(`File size exceeds limit of ${maxFileSize} bytes`);

          error.status = 413; // Payload Too Large
          monitorStream.destroy(error);
        }

        // Emit progress events if enabled
        if (enableProgress) {
          const elapsed = (performance.now() - startTime) / 1000; // seconds
          const speed = uploadedBytes / elapsed; // bytes per second

          req.emit('uploadProgress', {
            uploaded: uploadedBytes,
            total: req.headers['content-length'],
            percentage: req.headers['content-length']
              ? Math.min(100, (uploadedBytes / req.headers['content-length']) * 100)
              : 0,
            speed: speed,
            elapsed: elapsed
          });
        }
      });

      // Replace req with streaming capabilities
      req.streaming = {
        stream: monitorStream,
        uploadedBytes: () => uploadedBytes,
        isStreaming: true
      };

      // Handle stream errors
      monitorStream.on('error', (error) => {
        if (error.code === 'ENOENT') {
          next(new Error('Upload failed: File not found'));
        } else if (error.status === 413) {
          next(error);
        } else {
          next(new Error(`Upload failed: ${error.message}`));
        }
      });

      // Continue with normal processing
      next();
    };
  }

  /**
   * Create a stream transformer for content processing
   * @param {Function} transformFn - Transform function
   * @returns {Transform} Transform stream
   */
  static createTransformer(transformFn) {
    return new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        try {
          const result = transformFn(chunk, encoding);

          callback(null, result);
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  /**
   * Buffer stream data with size limits
   * @param {Readable} stream - Input stream
   * @param {number} maxSize - Maximum buffer size
   * @returns {Promise<Buffer>} Buffered data
   */
  static async bufferStream(stream, maxSize = 100 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      let totalSize = 0;

      stream.on('data', (chunk) => {
        totalSize += chunk.length;
        if (totalSize > maxSize) {
          reject(new Error(`Stream data exceeds maximum size of ${maxSize} bytes`));
          stream.destroy();

          return;
        }
        chunks.push(chunk);
      });

      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      stream.on('error', reject);
    });
  }

  /**
   * Stream content to verification service
   * @param {Readable} inputStream - Input stream
   * @param {Object} verificationService - Content verification service
   * @param {Object} options - Verification options
   * @returns {Promise<Object>} Verification result
   */
  static async streamToVerification(inputStream, verificationService, options = {}) {
    const startTime = performance.now();

    try {
      // Use the optimized streaming verification method
      const result = await verificationService.streamVerify(inputStream, options);

      // Add streaming performance metrics
      result.metadata.streamingDuration = performance.now() - startTime;
      result.details.streamingProcessed = true;

      return result;
    } catch (error) {
      throw new Error(`Streaming verification failed: ${error.message}`);
    }
  }

  /**
   * Create a throttled stream for rate limiting
   * @param {number} bytesPerSecond - Maximum bytes per second
   * @returns {Transform} Throttled stream
   */
  static createThrottledStream(bytesPerSecond) {
    let bytesSent = 0;
    const startTime = Date.now();

    return new Transform({
      transform(chunk, encoding, callback) {
        bytesSent += chunk.length;
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        const expectedTime = bytesSent / bytesPerSecond;

        if (elapsed < expectedTime) {
          const delay = (expectedTime - elapsed) * 1000;

          setTimeout(() => {
            callback(null, chunk);
          }, delay);
        } else {
          callback(null, chunk);
        }
      }
    });
  }

  /**
   * Create a stream with timeout
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Transform} Stream with timeout
   */
  static createTimeoutStream(timeoutMs = 30000) {
    let lastDataTime = Date.now();

    const timeoutStream = new Transform({
      transform(chunk, encoding, callback) {
        lastDataTime = Date.now();
        callback(null, chunk);
      }
    });

    // Check for timeout periodically
    const interval = setInterval(() => {
      if (Date.now() - lastDataTime > timeoutMs) {
        clearInterval(interval);
        timeoutStream.destroy(new Error(`Stream timeout after ${timeoutMs}ms`));
      }
    }, 1000);

    timeoutStream.on('end', () => {
      clearInterval(interval);
    });

    return timeoutStream;
  }
}

module.exports = StreamingMiddleware;
