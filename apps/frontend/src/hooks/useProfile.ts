import { useState } from 'react';
import { api, ApiError } from '@/utils/api';
import { ClientProfile, DiscoveryData } from '@/types';

export function useProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createProfile = async (data: DiscoveryData) => {
    if (!data.transcript || data.transcript.trim().length < 10) {
      setError('Añade la transcripción completa (mínimo 10 caracteres).');
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.createProfile(data);
      setProfile(response.client_profile);
      setProfileId(response.profile_id);
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Error desconocido al crear el perfil');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetProfile = () => {
    setProfile(null);
    setProfileId(null);
    setError(null);
  };

  return {
    profile,
    profileId,
    isLoading,
    error,
    createProfile,
    resetProfile,
    hasProfile: Boolean(profile),
  };
}