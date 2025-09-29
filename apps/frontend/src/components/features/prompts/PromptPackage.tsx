import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PromptCard } from './PromptCard';
import { PromptPackage as PromptPackageType } from '@/types';

interface PromptPackageProps {
  promptPackage: PromptPackageType | null;
  onCopyJSON: () => void;
  onBack: () => void;
  onCopyPrompt: (text: string, id: string) => Promise<boolean>;
  campaignName?: string | null;
}

export function PromptPackage({ 
  promptPackage, 
  onCopyJSON, 
  onBack, 
  onCopyPrompt,
  campaignName
}: PromptPackageProps) {
  const activeCampaign = campaignName ?? promptPackage?.campaign ?? 'Prompts';
  if (!promptPackage || !promptPackage.prompts.length) {
    return (
      <Card variant="elevated" padding="lg" className="text-center">
        <CardContent>
          <div className="py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin prompts generados</h3>
            <p className="text-gray-600">
              Genera primero el perfil y después ejecuta la acción "Generar paquete {activeCampaign}".
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Paquete de prompts · {activeCampaign}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {promptPackage.prompts.length} prompts generados para la campaña
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={onCopyJSON}
              leftIcon={<span>📋</span>}
            >
              Copiar JSON
            </Button>
            <Button
              variant="outline"
              onClick={onBack}
              leftIcon={<span>←</span>}
            >
              Volver a perfil
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {promptPackage.prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onCopy={(text) => onCopyPrompt(text, prompt.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
