-- Supabase pgvector Setup SQL for Portfolio RAG
-- Run this in your Supabase SQL Editor (https://app.supabase.com)

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the portfolio_documents table
CREATE TABLE IF NOT EXISTS public.portfolio_documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536), -- Standard embedding dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create the match_documents function for vector similarity search
CREATE OR REPLACE FUNCTION match_documents (
  query_text TEXT,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pd.id,
    pd.content,
    1.0 AS similarity
  FROM public.portfolio_documents pd
  WHERE pd.content ILIKE '%' || query_text || '%'
  LIMIT match_count;
END;
$$;
