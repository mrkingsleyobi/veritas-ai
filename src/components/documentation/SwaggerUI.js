import React, { useState, useEffect } from 'react';
import './SwaggerUI.css';

const SwaggerUI = () => {
  const [apiSpec, setApiSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real implementation, this would fetch from an actual OpenAPI spec
    const mockApiSpec = {
      openapi: "3.0.0",
      info: {
        title: "Veritas AI Deepfake Detection API",
        description: "API for detecting deepfakes and verifying content authenticity using RUV profile fusion",
        version: "v1.0.0",
        contact: {
          name: "API Support",
          email: "support@veritas-ai.com"
        }
      },
      servers: [
        {
          url: "https://api.veritas-ai.com/v1",
          description: "Production server"
        },
        {
          url: "https://staging-api.veritas-ai.com/v1",
          description: "Staging server"
        }
      ],
      security: [
        {
          bearerAuth: []
        }
      ],
      paths: {
        "/verify": {
          post: {
            summary: "Submit content for deepfake verification",
            description: "Submit content (image, video, or audio) for deepfake detection and authenticity verification",
            operationId: "verifyContent",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      content: {
                        type: "string",
                        description: "Base64 encoded content or URL to the content"
                      },
                      contentType: {
                        type: "string",
                        enum: ["image", "video", "audio"],
                        description: "Type of content being verified"
                      },
                      options: {
                        type: "object",
                        description: "Additional verification options"
                      }
                    },
                    required: ["content", "contentType"]
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Verification result",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        jobId: {
                          type: "string",
                          description: "Unique identifier for the verification job"
                        },
                        status: {
                          type: "string",
                          enum: ["pending", "processing", "completed", "failed"]
                        },
                        confidence: {
                          type: "number",
                          format: "float",
                          description: "Confidence score of verification result"
                        },
                        isAuthentic: {
                          type: "boolean",
                          description: "Whether the content is determined to be authentic"
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Invalid request",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        error: {
                          type: "string"
                        },
                        message: {
                          type: "string"
                        }
                      }
                    }
                  }
                }
              },
              "401": {
                description: "Unauthorized",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        error: {
                          type: "string"
                        },
                        message: {
                          type: "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      }
    };

    setTimeout(() => {
      setApiSpec(mockApiSpec);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="swagger-ui-loading">
        <div className="spinner"></div>
        <p>Loading API documentation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="swagger-ui-error">
        <h3>Error loading documentation</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="swagger-ui-container">
      <div className="swagger-header">
        <h2>API Reference</h2>
        <p>Interactive documentation for all API endpoints</p>
      </div>

      <div className="swagger-content">
        <div className="endpoint-summary">
          <h3>Core Endpoints</h3>
          <ul>
            <li>
              <strong>POST /verify</strong> - Submit content for deepfake verification
            </li>
            <li>
              <strong>GET /verify/{'{jobId}'}</strong> - Get verification results
            </li>
            <li>
              <strong>POST /batch-verify</strong> - Submit multiple items for verification
            </li>
            <li>
              <strong>GET /health</strong> - Check API health status
            </li>
          </ul>
        </div>

        <div className="api-details">
          <h3>Authentication</h3>
          <p>All API requests require authentication using a Bearer token in the Authorization header.</p>
          <pre>
            <code>Authorization: Bearer YOUR_API_KEY</code>
          </pre>

          <h3>Rate Limits</h3>
          <p>The API has rate limits based on your subscription tier:</p>
          <ul>
            <li>Free Tier: 100 requests/minute</li>
            <li>Pro Tier: 1,000 requests/minute</li>
            <li>Enterprise Tier: 10,000 requests/minute</li>
          </ul>

          <h3>Response Format</h3>
          <p>All responses are returned in JSON format with the following structure:</p>
          <pre>
            <code>
{`{
  "data": {},
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}`}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SwaggerUI;