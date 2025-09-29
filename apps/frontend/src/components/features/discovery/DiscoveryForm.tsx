import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DiscoveryData } from '@/types';

interface DiscoveryFormProps {
  onSubmit: (data: DiscoveryData) => Promise<boolean>;
  onReset: () => void;
  isLoading: boolean;
}

export function DiscoveryForm({ onSubmit, onReset, isLoading }: DiscoveryFormProps) {
  const [formData, setFormData] = useState<DiscoveryData>({
    transcript: '',
    clientName: '',
    website: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      // Mantener los datos del formulario después del éxito para referencia
    }
  };

  const handleReset = () => {
    setFormData({
      transcript: '',
      clientName: '',
      website: '',
      notes: ''
    });
    onReset();
  };

  return (
    <Card variant="elevated" padding="lg" className="h-fit animate-slide-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Discovery Call Recorder</CardTitle>
          <Badge variant="primary">Carga transcript · Clarbi DS-01</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Pega la transcripción completa de la reunión. Añade datos de contexto y Clarbi generará el perfil
          canónico para la campaña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            label="Transcripción completa *"
            placeholder="Pega aquí la conversación con el cliente..."
            rows={12}
            value={formData.transcript}
            onChange={(e) => setFormData(prev => ({ ...prev, transcript: e.target.value }))}
            className="font-mono text-sm"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Nombre del cliente"
              placeholder="Ej. Código Media"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            />
            
            <Input
              label="Web"
              placeholder="https://..."
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            />
            
            <Input
              label="Notas internas"
              placeholder="Restricciones, matices de tono, etc."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={isLoading}
            >
              Limpiar workspace
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : 'Generar perfil Clarbi'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}