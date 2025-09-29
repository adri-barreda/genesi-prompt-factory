import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ClientProfile } from '@/types';

interface ProfileViewProps {
  profile: ClientProfile | null;
  onGeneratePrompts: () => void;
  isGenerating: boolean;
  campaignName?: string | null;
}

const renderList = (items: string[]) => {
  if (!items.length) {
    return <span className="text-gray-500">—</span>;
  }

  return (
    <ul className="list-disc list-inside space-y-1 text-gray-900 text-sm">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};

const normalizeArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

export function ProfileView({ profile, onGeneratePrompts, isGenerating, campaignName }: ProfileViewProps) {
  const actionLabel = campaignName ? `Generar paquete ${campaignName}` : 'Generar paquete de prompts';

  if (!profile) {
    return (
      <Card variant="elevated" padding="lg" className="text-center">
        <CardContent>
          <div className="py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin perfil generado</h3>
            <p className="text-gray-600">
              Genera primero un perfil desde la pestaña "Discovery Toolkit".
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const caseStudy = {
    name: profile.case_study?.name ?? null,
    industry: profile.case_study?.industry ?? null,
    company_size: profile.case_study?.company_size ?? null,
    similar_companies: normalizeArray(profile.case_study?.similar_companies),
    problem: profile.case_study?.problem ?? null,
    solution: profile.case_study?.solution ?? null,
    phases: normalizeArray(profile.case_study?.phases),
    results: {
      general: normalizeArray(profile.case_study?.results?.general),
      numeric: normalizeArray(profile.case_study?.results?.numeric)
    }
  };

  const proofPoints = normalizeArray(profile.proof_points);
  const valueProps = normalizeArray(profile.value_props);
  const companyTypes = normalizeArray(profile.icp?.company_types);
  const buyerRoles = normalizeArray(profile.icp?.buyer_roles);
  const tone = profile.constraints?.tone ?? '—';
  const language = profile.constraints?.language ?? 'es-ES';
  const buyerPersona = profile.buyer_persona ?? null;

  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Perfil Clarbi</CardTitle>
          <Badge variant="success">Stage CLB-02</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {buyerPersona ? (
            <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
              <h4 className="text-sm font-semibold text-sky-800 uppercase tracking-wide mb-2">Buyer Persona</h4>
              <p className="text-sky-900 text-sm leading-relaxed">{buyerPersona}</p>
            </div>
          ) : null}

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Oferta
              </h4>
              <p className="text-gray-900">{profile.offer || '—'}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Tono
              </h4>
              <p className="text-gray-900">{tone}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Idioma
              </h4>
              <p className="text-gray-900">{language}</p>
            </div>
          </div>

          {/* Propuestas de valor e ICP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">
                Value Props
              </h4>
              <p className="text-blue-900 text-sm">
                {valueProps.length ? valueProps.join(', ') : '—'}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl">
              <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">
                Company Types
              </h4>
              <p className="text-green-900 text-sm">
                {companyTypes.length ? companyTypes.join(', ') : '—'}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-xl">
              <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-2">
                Buyer Roles
              </h4>
              <p className="text-purple-900 text-sm">
                {buyerRoles.length ? buyerRoles.join(', ') : '—'}
              </p>
            </div>
          </div>

          {/* Caso de éxito */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <h4 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide mb-2">
                Caso de éxito
              </h4>
              <dl className="space-y-2 text-sm text-emerald-900">
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-xs text-emerald-700">Nombre</dt>
                  <dd>{caseStudy.name || '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-xs text-emerald-700">Industria</dt>
                  <dd>{caseStudy.industry || '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-xs text-emerald-700">Tamaño de empresa</dt>
                  <dd>{caseStudy.company_size || '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-xs text-emerald-700">Empresas similares</dt>
                  <dd>{caseStudy.similar_companies.length ? caseStudy.similar_companies.join(', ') : '—'}</dd>
                </div>
              </dl>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <h4 className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">
                Problema y solución
              </h4>
              <div className="space-y-3 text-sm text-amber-900">
                <div>
                  <h5 className="font-semibold text-xs uppercase tracking-wide text-amber-700 mb-1">Problema detectado</h5>
                  <p>{caseStudy.problem || '—'}</p>
                </div>
                <div>
                  <h5 className="font-semibold text-xs uppercase tracking-wide text-amber-700 mb-1">Cómo lo resolvimos</h5>
                  <p>{caseStudy.solution || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fases y resultados */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <h4 className="text-sm font-semibold text-purple-800 uppercase tracking-wide mb-2">
                Fases clave
              </h4>
              {renderList(caseStudy.phases)}
            </div>
            <div className="p-4 bg-lime-50 rounded-xl border border-lime-100">
              <h4 className="text-sm font-semibold text-lime-800 uppercase tracking-wide mb-2">
                Resultados generales
              </h4>
              {renderList(caseStudy.results.general)}
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-2">
                Resultados numéricos
              </h4>
              {renderList(caseStudy.results.numeric)}
            </div>
          </div>

          {/* Resumen del cliente y social proof */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Resumen del Cliente
              </h4>
              <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-line">
                {profile.client_summary || '—'}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl">
              <h4 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide mb-2">
                Pruebas / Social Proof
              </h4>
              <div className="text-yellow-900 text-sm whitespace-pre-line">
                {proofPoints.length ? proofPoints.join('\n') : '—'}
              </div>
            </div>
          </div>

          {/* Botón de acción */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={onGeneratePrompts}
              isLoading={isGenerating}
              disabled={isGenerating}
              variant="primary"
              size="lg"
            >
              {isGenerating ? 'Generando...' : actionLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
