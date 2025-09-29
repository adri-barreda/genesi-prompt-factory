import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface PromptCardProps {
  prompt: {
    id: string;
    name: string;
    target_variable: string;
    prompt_text: string;
    depends_on: string[];
  };
  onCopy: (text: string) => Promise<boolean>;
}

export function PromptCard({ prompt, onCopy }: PromptCardProps) {
  return (
    <Card variant="bordered" padding="lg" className="hover:border-blue-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 animate-scale-in">
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Badge variant="info" size="sm">
                {prompt.target_variable}
              </Badge>
              <h3 className="text-lg font-semibold text-gray-900">
                {prompt.name}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(prompt.prompt_text)}
              leftIcon={<span>📋</span>}
            >
              Copiar prompt
            </Button>
          </div>

          {/* Prompt Content */}
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl text-sm leading-relaxed overflow-x-auto border border-gray-300">
              <code>{prompt.prompt_text}</code>
            </pre>
            
            {/* Copy overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCopy(prompt.prompt_text)}
                className="bg-white text-gray-900 shadow-lg"
              >
                Copiar contenido
              </Button>
            </div>
          </div>

          {/* Dependencies */}
          {prompt.depends_on.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Dependencias:
                </span>
                <div className="flex flex-wrap gap-1">
                  {prompt.depends_on.map((dep) => (
                    <Badge key={dep} variant="default" size="sm">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}