export interface ClientProfile {
  id?: string;
  offer: string | null;
  value_props: string[];
  icp: {
    company_types: string[];
    buyer_roles: string[];
  };
  case_study: {
    name: string | null;
    industry: string | null;
    company_size: string | null;
    similar_companies: string[];
    problem: string | null;
    solution: string | null;
    phases: string[];
    results: {
      general: string[];
      numeric: string[];
    };
  };
  proof_points: string[];
  constraints: {
    tone: string;
    language: string;
  };
  client_summary: string;
  buyer_persona: string | null;
}

export interface PromptPackage {
  campaign: string;
  prompts: Array<{
    id: string;
    name: string;
    target_variable: string;
    prompt_text: string;
    depends_on: string[];
  }>;
}

export interface ReverseVariable {
  variable_name: string;
  placeholder: string;
  source_snippet: string;
  goal: string;
  prompt_instructions: string;
  sample_outputs: string[];
}

export interface ReverseEngineeringResponse {
  variables: ReverseVariable[];
}

export interface Campaign {
  id: string;
  name: string;
}

export interface DiscoveryData {
  transcript: string;
  clientName: string;
  website: string;
  notes: string;
}

export type TabId = 'discovery' | 'profile' | 'prompts';

export interface Tab {
  id: TabId;
  label: string;
  icon?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ProfileResponse {
  profile_id: string;
  client_profile: ClientProfile;
}

export interface PromptsResponse {
  prompt_package: PromptPackage;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
}
