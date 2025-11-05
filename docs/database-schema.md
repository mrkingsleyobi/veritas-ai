# Database Schema Design

## Overview
This document describes the database schema for the Veritas AI platform, focusing on persistent storage for RUV profiles and content verification results.

## Tables

### 1. content_verification_results
Stores the results of content authenticity verification.

```sql
CREATE TABLE content_verification_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR(255) NOT NULL UNIQUE,
    content_type VARCHAR(50) NOT NULL,
    authentic BOOLEAN NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    details JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_verification_content_id ON content_verification_results(content_id);
CREATE INDEX idx_content_verification_authentic ON content_verification_results(authentic);
CREATE INDEX idx_content_verification_confidence ON content_verification_results(confidence);
CREATE INDEX idx_content_verification_created_at ON content_verification_results(created_at);
```

### 2. ruv_profiles
Stores RUV (Reputation, Uniqueness, Verification) profiles for content.

```sql
CREATE TABLE ruv_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR(255) NOT NULL UNIQUE,
    reputation DECIMAL(5,4) NOT NULL,
    uniqueness DECIMAL(5,4) NOT NULL,
    verification DECIMAL(5,4) NOT NULL,
    fusion_score DECIMAL(5,4) NOT NULL,
    history JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ruv_profiles_content_id ON ruv_profiles(content_id);
CREATE INDEX idx_ruv_profiles_fusion_score ON ruv_profiles(fusion_score);
CREATE INDEX idx_ruv_profiles_created_at ON ruv_profiles(created_at);
```

### 3. verification_history
Stores historical verification data for trend analysis.

```sql
CREATE TABLE verification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR(255) NOT NULL,
    verification_result_id UUID REFERENCES content_verification_results(id),
    ruv_profile_id UUID REFERENCES ruv_profiles(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confidence DECIMAL(5,4) NOT NULL,
    details JSONB
);

CREATE INDEX idx_verification_history_content_id ON verification_history(content_id);
CREATE INDEX idx_verification_history_timestamp ON verification_history(timestamp);
```

## Relationships
- `content_verification_results` and `ruv_profiles` are linked by `content_id`
- `verification_history` references both `content_verification_results` and `ruv_profiles`

## Indexes
- Primary keys on all tables
- Indexes on frequently queried columns (content_id, confidence, fusion_score, timestamps)
- Composite indexes for common query patterns

## Data Types
- UUID for primary keys
- VARCHAR for content identifiers
- DECIMAL for precise confidence scores
- JSONB for flexible detail storage
- TIMESTAMP WITH TIME ZONE for consistent time tracking

## Constraints
- NOT NULL constraints on required fields
- UNIQUE constraints on content_id in main tables
- Foreign key relationships where appropriate
- Check constraints for data validation (e.g., confidence between 0 and 1)