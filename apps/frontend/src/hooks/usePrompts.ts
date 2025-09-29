import { useState } from 'react';
import { api, ApiError } from '@/utils/api';
import { PromptPackage } from '@/types';

export function usePrompts() {
  const [isLoading, setIsLoading] = useState(false);
  const [promptPackage, setPromptPackage] = useState<PromptPackage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePrompts = async (profileId: string | null, campaignId: string | null) => {
    if (!profileId) {
      setError('Primero crea y guarda el perfil del cliente.');
      return false;
    }

    if (!campaignId) {
      setError('Selecciona una campaña para generar los prompts.');
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.generatePrompts(profileId, campaignId);
      setPromptPackage(response.prompt_package);
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Error desconocido al generar los prompts');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPrompts = () => {
    setPromptPackage(null);
    setError(null);
  };

  const copyToClipboard = async (text: string, errorPrefix = 'No se pudo copiar') => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      setError(`${errorPrefix} al portapapeles.`);
      return false;
    }
  };

  return {
    promptPackage,
    isLoading,
    error,
    generatePrompts,
    resetPrompts,
    copyToClipboard,
    hasPrompts: Boolean(promptPackage?.prompts?.length),
  };
}
