import { DiscoveryData, ProfileResponse, PromptsResponse, CampaignListResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error or unable to reach server');
  }
}

export const api = {
  listCampaigns: async (): Promise<CampaignListResponse> => {
    return apiRequest<CampaignListResponse>('/campaigns');
  },

  createProfile: async (data: DiscoveryData): Promise<ProfileResponse> => {
    return apiRequest<ProfileResponse>('/ingest', {
      method: 'POST',
      body: JSON.stringify({
        transcript: data.transcript,
        client_name: data.clientName || undefined,
        website: data.website || undefined,
        notes: data.notes || undefined,
      }),
    });
  },

  generatePrompts: async (profileId: string, campaignId: string): Promise<PromptsResponse> => {
    return apiRequest<PromptsResponse>(`/campaigns/${campaignId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId }),
    });
  },
};
