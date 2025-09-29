import { DiscoveryData, ProfileResponse, PromptsResponse, CampaignListResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Mock data for demo mode
const mockProfile = {
  id: 'demo-profile-123',
  offer: 'Servicios de automatización de procesos industriales',
  value_props: [
    'Reducción del 40% en tiempos de producción',
    'Mejora de la calidad y consistencia',
    'ROI comprobado en 6 meses'
  ],
  icp: {
    company_types: ['Industria manufacturera', 'Empresas medianas-grandes'],
    buyer_roles: ['Director de Operaciones', 'Jefe de Producción']
  },
  proof_points: [
    'Más de 200 proyectos exitosos',
    'Certificación ISO 9001',
    'Casos de éxito documentados'
  ],
  constraints: {
    tone: 'natural, directo, sin corporativismo',
    language: 'es-ES'
  },
  data_sources: {
    industrial_data: 'Empresa manufacturera con procesos tradicionales que busca modernizar su línea de producción. Problemas principales: ineficiencias en cadena de montaje, altos tiempos de setup, control de calidad manual. Oportunidades: automatización de procesos repetitivos, implementación de sistemas de monitoreo IoT.'
  }
};

const mockPrompts = {
  campaign: 'Creative Ideas',
  prompts: [
    {
      id: 'creative_ideas_e1_1',
      name: 'Apertura - Viendo vuestra web',
      target_variable: 'HR-Industriales | Creative Ideas E1.1',
      prompt_text: 'Eres un experto en automatización industrial escribiendo un email de prospección...',
      depends_on: []
    },
    {
      id: 'creative_ideas_e1_2',
      name: 'Idea formativa 1',
      target_variable: 'HR-Industriales | Creative Ideas E1.2',
      prompt_text: 'Crea una idea educativa sobre optimización de procesos...',
      depends_on: []
    }
  ]
};

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
    // If OpenAI is not configured, fallback to demo mode
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      console.warn('OpenAI not configured, using demo mode');
      return handleDemoMode<T>(endpoint, options);
    }
    throw new ApiError('Network error or unable to reach server');
  }
}

function handleDemoMode<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (endpoint === '/campaigns') {
        resolve({ campaigns: [{ id: 'creative-ideas', name: 'Creative Ideas' }] } as T);
      } else if (endpoint === '/ingest') {
        resolve({ profile_id: mockProfile.id, client_profile: mockProfile } as T);
      } else if (endpoint.includes('/generate')) {
        resolve({ campaign: 'creative-ideas', prompt_package: mockPrompts } as T);
      } else {
        resolve({} as T);
      }
    }, 800); // Simulate network delay
  });
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
