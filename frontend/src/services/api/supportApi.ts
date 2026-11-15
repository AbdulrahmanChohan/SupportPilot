import { apiClient } from './client';
import {
  HealthResponse,
  ChatRequest,
  ChatResponse,
  OrderResponse,
  RefundCreateRequest,
  RefundResponse,
  StagedRefundRecord,
  PolicyDocument,
} from './types';

export const supportApi = {
  /** Check backend health, vector indexing, and model availability */
  getHealth: async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>('/api/health');
    return res.data;
  },

  /** Send chat prompt to SupportPilot agent (non-streaming) */
  sendChat: async (payload: ChatRequest): Promise<ChatResponse> => {
    const res = await apiClient.post<ChatResponse>('/api/chat', payload);
    return res.data;
  },

  /** Stream chat tokens from backend via Server-Sent Events (SSE) */
  streamChat: async (
    payload: ChatRequest,
    callbacks: {
      onToken: (token: string) => void;
      onMeta?: (meta: { decision?: string; tools_used?: string[]; sources?: any[] }) => void;
      onError?: (error: Error) => void;
      onDone?: () => void;
    }
  ): Promise<void> => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Server error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Streaming response body not supported.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.replace(/^data:\s*/, '').trim();

          if (dataStr === '[DONE]') {
            callbacks.onDone?.();
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === 'token' && typeof parsed.content === 'string') {
              callbacks.onToken(parsed.content);
            } else if (parsed.type === 'meta') {
              callbacks.onMeta?.(parsed);
            }
          } catch {
            // Ignore partial parse
          }
        }
      }
      callbacks.onDone?.();
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      callbacks.onError?.(errorObj);
      throw errorObj;
    }
  },

  /** Lookup order status by ID */
  getOrder: async (orderId: string): Promise<OrderResponse> => {
    const res = await apiClient.get<OrderResponse>(`/api/orders/${encodeURIComponent(orderId)}`);
    return res.data;
  },

  /** Stage a refund request for human supervisor approval */
  createRefund: async (payload: RefundCreateRequest): Promise<RefundResponse> => {
    const res = await apiClient.post<RefundResponse>('/api/refunds', payload);
    return res.data;
  },

  /** Fetch all staged refund requests pending human approval */
  getRefunds: async (): Promise<StagedRefundRecord[]> => {
    const res = await apiClient.get<StagedRefundRecord[]>('/api/refunds');
    return res.data;
  },

  /** Fetch all 25 policy documents indexed in the knowledge base */
  getPolicies: async (): Promise<PolicyDocument[]> => {
    const res = await apiClient.get<PolicyDocument[]>('/api/policies');
    return res.data;
  },
};
