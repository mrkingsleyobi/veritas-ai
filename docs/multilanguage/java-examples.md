# Java Integration Examples

This guide provides comprehensive Java examples for integrating with the Veritas AI Content Authenticity and Deepfake Detection API.

## Prerequisites

- Java 8 or higher
- Maven or Gradle build tool
- JSON processing library (Jackson or Gson)
- HTTP client library (Apache HttpClient or OkHttp)

## Maven Dependencies

```xml
<!-- pom.xml -->
<dependencies>
    <!-- HTTP Client -->
    <dependency>
        <groupId>org.apache.httpcomponents</groupId>
        <artifactId>httpclient</artifactId>
        <version>4.5.14</version>
    </dependency>

    <!-- JSON Processing -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.15.2</version>
    </dependency>

    <!-- Apache Commons Codec for Base64 -->
    <dependency>
        <groupId>commons-codec</groupId>
        <artifactId>commons-codec</artifactId>
        <version>1.16.0</version>
    </dependency>

    <!-- Logging -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.9</version>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Gradle Dependencies

```gradle
// build.gradle
dependencies {
    // HTTP Client
    implementation 'org.apache.httpcomponents:httpclient:4.5.14'

    // JSON Processing
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.15.2'

    // Apache Commons Codec for Base64
    implementation 'commons-codec:commons-codec:1.16.0'

    // Logging
    implementation 'org.slf4j:slf4j-api:2.0.9'

    // Testing
    testImplementation 'junit:junit:4.13.2'
}
```

## Configuration Class

```java
// VeritasConfig.java
package com.veritas.client.config;

import java.util.Properties;
import java.io.InputStream;
import java.io.IOException;

public class VeritasConfig {
    private String baseUrl;
    private String username;
    private String password;
    private int maxRetries;
    private int timeout;
    private int batchSize;

    public VeritasConfig() {
        loadFromProperties();
    }

    private void loadFromProperties() {
        try (InputStream input = getClass().getClassLoader()
                .getResourceAsStream("veritas.properties")) {

            Properties prop = new Properties();
            if (input != null) {
                prop.load(input);

                this.baseUrl = prop.getProperty("veritas.base.url", "https://api.veritas-ai.com/v1");
                this.username = prop.getProperty("veritas.username");
                this.password = prop.getProperty("veritas.password");
                this.maxRetries = Integer.parseInt(prop.getProperty("veritas.max.retries", "3"));
                this.timeout = Integer.parseInt(prop.getProperty("veritas.timeout", "30"));
                this.batchSize = Integer.parseInt(prop.getProperty("veritas.batch.size", "10"));
            }
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    // Getters and Setters
    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public int getMaxRetries() { return maxRetries; }
    public void setMaxRetries(int maxRetries) { this.maxRetries = maxRetries; }

    public int getTimeout() { return timeout; }
    public void setTimeout(int timeout) { this.timeout = timeout; }

    public int getBatchSize() { return batchSize; }
    public void setBatchSize(int batchSize) { this.batchSize = batchSize; }

    public void validate() throws IllegalStateException {
        if (username == null || username.isEmpty()) {
            throw new IllegalStateException("Username is required");
        }
        if (password == null || password.isEmpty()) {
            throw new IllegalStateException("Password is required");
        }
    }
}
```

## Authentication Service

```java
// AuthService.java
package com.veritas.client.auth;

import com.veritas.client.config.VeritasConfig;
import com.veritas.client.model.AuthResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final VeritasConfig config;
    private final ObjectMapper objectMapper;
    private String authToken;
    private long tokenExpiry;

    public AuthService(VeritasConfig config) {
        this.config = config;
        this.objectMapper = new ObjectMapper();
    }

    public String generateToken() throws Exception {
        logger.info("Generating authentication token");

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(config.getBaseUrl() + "/auth/token");
            httpPost.setHeader("Content-Type", "application/json");

            // Prepare request payload
            Map<String, String> payload = new HashMap<>();
            payload.put("username", config.getUsername());
            payload.put("password", config.getPassword());

            String jsonPayload = objectMapper.writeValueAsString(payload);
            httpPost.setEntity(new StringEntity(jsonPayload, "UTF-8"));

            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                int statusCode = response.getStatusLine().getStatusCode();

                if (statusCode == 200) {
                    String responseBody = EntityUtils.toString(response.getEntity());
                    AuthResponse authResponse = objectMapper.readValue(responseBody, AuthResponse.class);

                    this.authToken = authResponse.getToken();
                    this.tokenExpiry = System.currentTimeMillis() + (authResponse.getExpiresIn() * 1000);

                    logger.info("Token generated successfully, expires in {} seconds", authResponse.getExpiresIn());
                    return this.authToken;
                } else {
                    String errorBody = EntityUtils.toString(response.getEntity());
                    logger.error("Authentication failed with status {}: {}", statusCode, errorBody);
                    throw new Exception("Authentication failed: " + errorBody);
                }
            }
        }
    }

    public boolean isTokenValid() {
        return authToken != null && System.currentTimeMillis() < tokenExpiry;
    }

    public String getValidToken() throws Exception {
        if (!isTokenValid()) {
            generateToken();
        }
        return authToken;
    }
}
```

## Authentication Response Model

```java
// AuthResponse.java
package com.veritas.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthResponse {
    @JsonProperty("token")
    private String token;

    @JsonProperty("expires_in")
    private int expiresIn;

    // Constructors
    public AuthResponse() {}

    public AuthResponse(String token, int expiresIn) {
        this.token = token;
        this.expiresIn = expiresIn;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public int getExpiresIn() { return expiresIn; }
    public void setExpiresIn(int expiresIn) { this.expiresIn = expiresIn; }
}
```

## Content Verification Service

```java
// ContentVerificationService.java
package com.veritas.client.verification;

import com.veritas.client.config.VeritasConfig;
import com.veritas.client.auth.AuthService;
import com.veritas.client.model.VerificationRequest;
import com.veritas.client.model.VerificationResult;
import com.veritas.client.util.Base64Util;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.nio.file.Files;
import java.util.Map;

public class ContentVerificationService {
    private static final Logger logger = LoggerFactory.getLogger(ContentVerificationService.class);

    private final VeritasConfig config;
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    public ContentVerificationService(VeritasConfig config, AuthService authService) {
        this.config = config;
        this.authService = authService;
        this.objectMapper = new ObjectMapper();
    }

    public VerificationResult verifyImage(String imagePath) throws Exception {
        return verifyContent(imagePath, "image");
    }

    public VerificationResult verifyVideo(String videoPath) throws Exception {
        return verifyContent(videoPath, "video");
    }

    public VerificationResult verifyDocument(String documentPath) throws Exception {
        return verifyContent(documentPath, "document");
    }

    private VerificationResult verifyContent(String filePath, String contentType) throws Exception {
        logger.info("Verifying {} content: {}", contentType, filePath);

        // Read and encode file
        File file = new File(filePath);
        byte[] fileContent = Files.readAllBytes(file.toPath());
        String encodedContent = Base64Util.encode(fileContent);

        // Prepare request
        VerificationRequest request = new VerificationRequest();
        request.setContent(encodedContent);
        request.setContentType(contentType);
        request.setFilename(file.getName());

        Map<String, Object> metadata = Map.of(
            "source", "java_client",
            "timestamp", System.currentTimeMillis() / 1000L,
            "file_size", fileContent.length
        );
        request.setMetadata(metadata);

        // Send verification request
        return sendVerificationRequest(request);
    }

    private VerificationResult sendVerificationRequest(VerificationRequest request) throws Exception {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(config.getBaseUrl() + "/verify");
            httpPost.setHeader("Authorization", "Bearer " + authService.getValidToken());
            httpPost.setHeader("Content-Type", "application/json");

            String jsonRequest = objectMapper.writeValueAsString(request);
            httpPost.setEntity(new StringEntity(jsonRequest, "UTF-8"));

            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                int statusCode = response.getStatusLine().getStatusCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode == 200) {
                    return objectMapper.readValue(responseBody, VerificationResult.class);
                } else {
                    logger.error("Verification failed with status {}: {}", statusCode, responseBody);
                    throw new Exception("Verification failed: " + responseBody);
                }
            }
        }
    }
}
```

## Verification Models

```java
// VerificationRequest.java
package com.veritas.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public class VerificationRequest {
    @JsonProperty("content")
    private String content;

    @JsonProperty("content_type")
    private String contentType;

    @JsonProperty("filename")
    private String filename;

    @JsonProperty("metadata")
    private Map<String, Object> metadata;

    // Constructors
    public VerificationRequest() {}

    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
```

```java
// VerificationResult.java
package com.veritas.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;

public class VerificationResult {
    @JsonProperty("id")
    private String id;

    @JsonProperty("content_id")
    private String contentId;

    @JsonProperty("authentic")
    private boolean authentic;

    @JsonProperty("confidence")
    private double confidence;

    @JsonProperty("details")
    private VerificationDetails details;

    @JsonProperty("metadata")
    private VerificationMetadata metadata;

    @JsonProperty("ruv_profile")
    private RUVProfile ruvProfile;

    @JsonProperty("created_at")
    private Date createdAt;

    // Constructors
    public VerificationResult() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getContentId() { return contentId; }
    public void setContentId(String contentId) { this.contentId = contentId; }

    public boolean isAuthentic() { return authentic; }
    public void setAuthentic(boolean authentic) { this.authentic = authentic; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public VerificationDetails getDetails() { return details; }
    public void setDetails(VerificationDetails details) { this.details = details; }

    public VerificationMetadata getMetadata() { return metadata; }
    public void setMetadata(VerificationMetadata metadata) { this.metadata = metadata; }

    public RUVProfile getRuvProfile() { return ruvProfile; }
    public void setRuvProfile(RUVProfile ruvProfile) { this.ruvProfile = ruvProfile; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
```

```java
// VerificationDetails.java
package com.veritas.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class VerificationDetails {
    @JsonProperty("method")
    private String method;

    @JsonProperty("metadata_present")
    private boolean metadataPresent;

    @JsonProperty("compression_artifacts")
    private boolean compressionArtifacts;

    @JsonProperty("file_size")
    private long fileSize;

    // Constructors
    public VerificationDetails() {}

    // Getters and Setters
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public boolean isMetadataPresent() { return metadataPresent; }
    public void setMetadataPresent(boolean metadataPresent) { this.metadataPresent = metadataPresent; }

    public boolean isCompressionArtifacts() { return compressionArtifacts; }
    public void setCompressionArtifacts(boolean compressionArtifacts) { this.compressionArtifacts = compressionArtifacts; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
}
```

```java
// VerificationMetadata.java
package com.veritas.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;

public class VerificationMetadata {
    @JsonProperty("timestamp")
    private Date timestamp;

    @JsonProperty("content_length")
    private long contentLength;

    // Constructors
    public VerificationMetadata() {}

    // Getters and Setters
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }

    public long getContentLength() { return contentLength; }
    public void setContentLength(long contentLength) { this.contentLength = contentLength; }
}
```

```java
// RUVProfile.java
package com.veritas.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;
import java.util.List;

public class RUVProfile {
    @JsonProperty("content_id")
    private String contentId;

    @JsonProperty("reputation")
    private double reputation;

    @JsonProperty("uniqueness")
    private double uniqueness;

    @JsonProperty("verification")
    private double verification;

    @JsonProperty("fusion_score")
    private double fusionScore;

    @JsonProperty("history")
    private List<RUVHistory> history;

    @JsonProperty("created_at")
    private Date createdAt;

    @JsonProperty("updated_at")
    private Date updatedAt;

    // Constructors
    public RUVProfile() {}

    // Getters and Setters
    public String getContentId() { return contentId; }
    public void setContentId(String contentId) { this.contentId = contentId; }

    public double getReputation() { return reputation; }
    public void setReputation(double reputation) { this.reputation = reputation; }

    public double getUniqueness() { return uniqueness; }
    public void setUniqueness(double uniqueness) { this.uniqueness = uniqueness; }

    public double getVerification() { return verification; }
    public void setVerification(double verification) { this.verification = verification; }

    public double getFusionScore() { return fusionScore; }
    public void setFusionScore(double fusionScore) { this.fusionScore = fusionScore; }

    public List<RUVHistory> getHistory() { return history; }
    public void setHistory(List<RUVHistory> history) { this.history = history; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
```

```java
// RUVHistory.java
package com.veritas.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;

public class RUVHistory {
    @JsonProperty("timestamp")
    private Date timestamp;

    @JsonProperty("reputation")
    private double reputation;

    @JsonProperty("uniqueness")
    private double uniqueness;

    @JsonProperty("verification")
    private double verification;

    // Constructors
    public RUVHistory() {}

    // Getters and Setters
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }

    public double getReputation() { return reputation; }
    public void setReputation(double reputation) { this.reputation = reputation; }

    public double getUniqueness() { return uniqueness; }
    public void setUniqueness(double uniqueness) { this.uniqueness = uniqueness; }

    public double getVerification() { return verification; }
    public void setVerification(double verification) { this.verification = verification; }
}
```

## Batch Processing Service

```java
// BatchProcessingService.java
package com.veritas.client.batch;

import com.veritas.client.config.VeritasConfig;
import com.veritas.client.auth.AuthService;
import com.veritas.client.model.BatchVerificationRequest;
import com.veritas.client.model.BatchVerificationResult;
import com.veritas.client.model.BatchContentItem;
import com.veritas.client.util.Base64Util;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class BatchProcessingService {
    private static final Logger logger = LoggerFactory.getLogger(BatchProcessingService.class);

    private final VeritasConfig config;
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    public BatchProcessingService(VeritasConfig config, AuthService authService) {
        this.config = config;
        this.authService = authService;
        this.objectMapper = new ObjectMapper();
    }

    public BatchVerificationResult batchVerify(List<BatchContentItem> contentItems) throws Exception {
        logger.info("Processing batch verification for {} items", contentItems.size());

        // Prepare batch request
        BatchVerificationRequest request = new BatchVerificationRequest();
        List<BatchContentItem> encodedItems = new ArrayList<>();

        for (int i = 0; i < contentItems.size(); i++) {
            BatchContentItem item = contentItems.get(i);

            // Read and encode content
            File file = new File(item.getPath());
            byte[] fileContent = Files.readAllBytes(file.toPath());
            String encodedContent = Base64Util.encode(fileContent);

            // Create encoded item
            BatchContentItem encodedItem = new BatchContentItem();
            encodedItem.setId("item_" + i);
            encodedItem.setContent(encodedContent);
            encodedItem.setContentType(item.getContentType());
            encodedItem.setFilename(item.getFilename() != null ? item.getFilename() : file.getName());
            encodedItem.setMetadata(item.getMetadata() != null ? item.getMetadata() : Map.of(
                "source", "java_batch_client",
                "batch_index", i
            ));

            encodedItems.add(encodedItem);
        }

        request.setContents(encodedItems);

        // Send batch verification request
        return sendBatchVerificationRequest(request);
    }

    private BatchVerificationResult sendBatchVerificationRequest(BatchVerificationRequest request) throws Exception {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(config.getBaseUrl() + "/batch/verify");
            httpPost.setHeader("Authorization", "Bearer " + authService.getValidToken());
            httpPost.setHeader("Content-Type", "application/json");

            String jsonRequest = objectMapper.writeValueAsString(request);
            httpPost.setEntity(new StringEntity(jsonRequest, "UTF-8"));

            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                int statusCode = response.getStatusLine().getStatusCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode == 200) {
                    return objectMapper.readValue(responseBody, BatchVerificationResult.class);
                } else {
                    logger.error("Batch verification failed with status {}: {}", statusCode, responseBody);
                    throw new Exception("Batch verification failed: " + responseBody);
                }
            }
        }
    }
}
```

## Batch Models

```java
// BatchVerificationRequest.java
package com.veritas.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class BatchVerificationRequest {
    @JsonProperty("contents")
    private List<BatchContentItem> contents;

    // Constructors
    public BatchVerificationRequest() {}

    // Getters and Setters
    public List<BatchContentItem> getContents() { return contents; }
    public void setContents(List<BatchContentItem> contents) { this.contents = contents; }
}
```

```java
// BatchContentItem.java
package com.veritas.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public class BatchContentItem {
    @JsonProperty("id")
    private String id;

    @JsonProperty("content")
    private String content;

    @JsonProperty("content_type")
    private String contentType;

    @JsonProperty("filename")
    private String filename;

    @JsonProperty("metadata")
    private Map<String, Object> metadata;

    // Additional field for local file path (not sent to API)
    private String path;

    // Constructors
    public BatchContentItem() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
}
```

```java
// BatchVerificationResult.java
package com.veritas.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class BatchVerificationResult {
    @JsonProperty("results")
    private List<BatchResultItem> results;

    // Constructors
    public BatchVerificationResult() {}

    // Getters and Setters
    public List<BatchResultItem> getResults() { return results; }
    public void setResults(List<BatchResultItem> results) { this.results = results; }
}
```

```java
// BatchResultItem.java
package com.veritas.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BatchResultItem {
    @JsonProperty("content_id")
    private String contentId;

    @JsonProperty("authentic")
    private boolean authentic;

    @JsonProperty("confidence")
    private double confidence;

    @JsonProperty("error")
    private String error;

    // Constructors
    public BatchResultItem() {}

    // Getters and Setters
    public String getContentId() { return contentId; }
    public void setContentId(String contentId) { this.contentId = contentId; }

    public boolean isAuthentic() { return authentic; }
    public void setAuthentic(boolean authentic) { this.authentic = authentic; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
```

## Utility Classes

```java
// Base64Util.java
package com.veritas.client.util;

import org.apache.commons.codec.binary.Base64;

public class Base64Util {
    public static String encode(byte[] data) {
        return Base64.encodeBase64String(data);
    }

    public static byte[] decode(String encodedData) {
        return Base64.decodeBase64(encodedData);
    }
}
```

## Usage Examples

```java
// VeritasClientExample.java
package com.veritas.client.example;

import com.veritas.client.config.VeritasConfig;
import com.veritas.client.auth.AuthService;
import com.veritas.client.verification.ContentVerificationService;
import com.veritas.client.batch.BatchProcessingService;
import com.veritas.client.model.VerificationResult;
import com.veritas.client.model.BatchContentItem;
import com.veritas.client.model.BatchVerificationResult;

import java.util.ArrayList;
import java.util.List;

public class VeritasClientExample {
    public static void main(String[] args) {
        try {
            // Initialize configuration
            VeritasConfig config = new VeritasConfig();
            config.validate();

            // Initialize services
            AuthService authService = new AuthService(config);
            ContentVerificationService verificationService = new ContentVerificationService(config, authService);
            BatchProcessingService batchService = new BatchProcessingService(config, authService);

            // Example 1: Single image verification
            System.out.println("=== Single Image Verification ===");
            VerificationResult imageResult = verificationService.verifyImage("path/to/suspicious_image.jpg");
            if (imageResult != null) {
                System.out.println("Authentic: " + imageResult.isAuthentic());
                System.out.println("Confidence: " + String.format("%.2f", imageResult.getConfidence()));
                System.out.println("RUV Score: " + String.format("%.2f", imageResult.getRuvProfile().getFusionScore()));
            }

            // Example 2: Batch processing
            System.out.println("\n=== Batch Processing ===");
            List<BatchContentItem> batchItems = new ArrayList<>();

            BatchContentItem item1 = new BatchContentItem();
            item1.setPath("path/to/image1.jpg");
            item1.setContentType("image");
            item1.setFilename("suspect1.jpg");
            batchItems.add(item1);

            BatchContentItem item2 = new BatchContentItem();
            item2.setPath("path/to/video1.mp4");
            item2.setContentType("video");
            item2.setFilename("suspect1.mp4");
            batchItems.add(item2);

            BatchContentItem item3 = new BatchContentItem();
            item3.setPath("path/to/doc1.pdf");
            item3.setContentType("document");
            item3.setFilename("suspect1.pdf");
            batchItems.add(item3);

            BatchVerificationResult batchResult = batchService.batchVerify(batchItems);
            if (batchResult != null) {
                batchResult.getResults().forEach(result -> {
                    if (result.getError() != null) {
                        System.out.println("Error for " + result.getContentId() + ": " + result.getError());
                    } else {
                        System.out.println(result.getContentId() + ": Authentic=" + result.isAuthentic() +
                                         ", Confidence=" + String.format("%.2f", result.getConfidence()));
                    }
                });
            }

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
```

## Advanced Features

### Retry Logic Implementation

```java
// RetryableVerificationService.java
package com.veritas.client.advanced;

import com.veritas.client.config.VeritasConfig;
import com.veritas.client.auth.AuthService;
import com.veritas.client.verification.ContentVerificationService;
import com.veritas.client.model.VerificationResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RetryableVerificationService extends ContentVerificationService {
    private static final Logger logger = LoggerFactory.getLogger(RetryableVerificationService.class);

    private final int maxRetries;
    private final long retryDelay;

    public RetryableVerificationService(VeritasConfig config, AuthService authService) {
        super(config, authService);
        this.maxRetries = config.getMaxRetries();
        this.retryDelay = 1000; // 1 second
    }

    @Override
    public VerificationResult verifyImage(String imagePath) throws Exception {
        return retryableVerify(() -> super.verifyImage(imagePath));
    }

    @Override
    public VerificationResult verifyVideo(String videoPath) throws Exception {
        return retryableVerify(() -> super.verifyVideo(videoPath));
    }

    @Override
    public VerificationResult verifyDocument(String documentPath) throws Exception {
        return retryableVerify(() -> super.verifyDocument(documentPath));
    }

    private VerificationResult retryableVerify(VerificationTask task) throws Exception {
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return task.execute();
            } catch (Exception e) {
                lastException = e;
                logger.warn("Attempt {} failed: {}", attempt, e.getMessage());

                if (attempt < maxRetries) {
                    long delay = retryDelay * (1L << (attempt - 1)); // Exponential backoff
                    logger.info("Retrying in {} ms...", delay);
                    Thread.sleep(delay);
                }
            }
        }

        throw new Exception("All retry attempts failed", lastException);
    }

    @FunctionalInterface
    private interface VerificationTask {
        VerificationResult execute() throws Exception;
    }
}
```

### Asynchronous Processing

```java
// AsyncVerificationService.java
package com.veritas.client.advanced;

import com.veritas.client.config.VeritasConfig;
import com.veritas.client.auth.AuthService;
import com.veritas.client.verification.ContentVerificationService;
import com.veritas.client.model.VerificationResult;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AsyncVerificationService extends ContentVerificationService {
    private final ExecutorService executorService;

    public AsyncVerificationService(VeritasConfig config, AuthService authService) {
        super(config, authService);
        this.executorService = Executors.newFixedThreadPool(10);
    }

    public CompletableFuture<VerificationResult> verifyImageAsync(String imagePath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return verifyImage(imagePath);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, executorService);
    }

    public CompletableFuture<VerificationResult> verifyVideoAsync(String videoPath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return verifyVideo(videoPath);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, executorService);
    }

    public CompletableFuture<VerificationResult> verifyDocumentAsync(String documentPath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return verifyDocument(documentPath);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, executorService);
    }

    public void shutdown() {
        executorService.shutdown();
    }
}
```

### Configuration Properties File

```properties
# src/main/resources/veritas.properties
veritas.base.url=https://api.veritas-ai.com/v1
veritas.username=your_username
veritas.password=your_password
veritas.max.retries=3
veritas.timeout=30
veritas.batch.size=10
```

This Java integration guide provides comprehensive examples for working with the Veritas AI Content Authenticity and Deepfake Detection API, covering authentication, content verification, batch processing, and advanced features.