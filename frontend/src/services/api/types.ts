/**
 * SupportPilot: TypeScript API Contract Definitions
 * Strict types matching FastAPI Pydantic request and response schemas.
 */

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  policies_count: number;
  vectors_indexed: number;
  bm25_indexed: number;
  azure_configured: boolean;
}

export interface DocumentSource {
  doc_id: string;
  title: string;
  rrf_score?: number | null;
  vector_score?: number | null;
  bm25_score?: number | null;
}

export interface ChatRequest {
  query: string;
  order_id?: string | null;
  mock_mode?: boolean | null;
}

export interface ChatResponse {
  query: string;
  answer: string;
  decision: 'ANSWER_GENERATED' | 'ESCALATE' | string;
  sources: DocumentSource[];
  tools_used: string[];
  status: string;
}

export interface Order {
  order_id: string;
  customer_name: string;
  status: 'in_transit' | 'delivered' | 'processing' | string;
  payment_status: string;
  shipping_method: string;
  tracking_number: string | null;
  estimated_delivery: string;
  items: string[];
  total: number;
  currency: string;
}

export interface OrderResponse {
  success: boolean;
  order?: Order | null;
  message?: string | null;
}

export interface StagedRefundRecord {
  request_id: string;
  order_id: string;
  customer_name?: string | null;
  reason: string;
  amount?: number | null;
  currency: string;
  status: 'pending_human_approval' | string;
  created_at: string;
}

export interface RefundCreateRequest {
  order_id: string;
  reason: string;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  request?: StagedRefundRecord | null;
  is_duplicate?: boolean;
}

export interface PolicyDocument {
  doc_id: string;
  title: string;
  content: string;
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  decision?: string;
  sources?: DocumentSource[];
  tools_used?: string[];
  isError?: boolean;
  isStreaming?: boolean;
}
